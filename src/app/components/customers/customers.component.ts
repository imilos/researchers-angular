import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Customer } from '../../models/customer.model';
import { CustomerService } from '../../services/customer.service';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-customers',
  standalone: true,
  templateUrl: './customers.component.html',
  imports: [FormsModule, NgFor, NgIf, NgClass],
  styleUrls: ['./customers.component.css']
})
export class CustomersComponent implements OnInit {
  customers: Customer[] = [];
  customer: Customer = { name: '', email: '', orcid: '', faculty_id: undefined, department_id: undefined };
  faculties: any[] = []; // Array to hold faculties
  departments: any[] = []; // Array to hold departments
  filteredDepartments: any[] = []; // Array to hold departments filtered by faculty
  isEditing: boolean = false;
  message: string = ''; // Success or error message
  isError: boolean = false; // Flag to differentiate between success and error messages
  deleteCustomerId: number | null = null;
  deleteCustomerName: string | undefined = '';
  currentPage: number = 1;
  pageSize: number = 5;
  totalPages: number = 1;
  filterString: string = '';

  orcidurl: string = environment.orcidurl;
  scopusurl: string = environment.scopusurl;
  ecrisurl: string = environment.ecrisurl;
  unikgurl: string = environment.unikgurl;

  constructor(private customerService: CustomerService, private router: Router, private cdr: ChangeDetectorRef) {}
  
  ngOnInit(): void {
    this.loadCustomers();
    this.customerService.getFaculties().subscribe({
      next: (data) => {
        this.faculties = data;
      },
      error: (error) => {
        console.error('Error fetching faculties:', error);
      }
    });

    this.customerService.getDepartments().subscribe({
      next: (data) => {
        this.departments = data;
      },
      error: (error) => {
        console.error('Error fetching departments:', error);
      }
    });
  }

  changePage(page: number): void {
    console.log(page, this.totalPages);
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadCustomers();
    }
  }

  loadCustomers(): void {
    this.customerService.getCustomers(this.currentPage, this.pageSize, this.filterString).subscribe({
      next: response => {
        this.customers = response.data;
        this.totalPages = response.paging.total_pages;
        console.log();
      },
      error: err => {
        this.showMessage(err, true); // Display error message
      }
    });
  }


  saveCustomer(): void {
    const serviceCall = this.isEditing
      ? this.customerService.updateCustomer(this.customer.id!, this.customer)
      : this.customerService.addCustomer(this.customer);

    serviceCall.subscribe({
      next: response => {
        this.loadCustomers();
        this.resetForm();
        this.showMessage(response.message, false); // Display success message
      },
      error: err => {
        this.showMessage(err, true); // Display error message
      }
    });
  }

  openDeleteModal(id: number): void {
    this.deleteCustomerId = id;
    const customer = this.customers.find(c => c.id === id);
    this.deleteCustomerName = customer?.name;
  }

  confirmDelete(): void {
    if (this.deleteCustomerId !== null) {
      this.customerService.deleteCustomer(this.deleteCustomerId).subscribe(() => {
        this.loadCustomers();
        this.message = 'Customer deleted successfully!';
        this.deleteCustomerId = null;
      });
    }
  }  

  editCustomer(cust: Customer): void {
    this.filteredDepartments = this.departments.filter(d => d.faculty_id == cust.faculty_id);
    this.customer = { ...cust };    
    this.isEditing = true;
  }

  resetForm(): void {
    this.customer = { name: '', email: '', orcid: '', scopusid: '', ecrisid: '', faculty_id: undefined, department_id: undefined };
    this.isEditing = false;
  }

  logout(): void {
    this.customerService.logout().subscribe({
      next: (response) => {
        localStorage.removeItem('access_token');
        this.router.navigate(['/login']);
      },
      error: err => {
        this.showMessage(err, true);
      }
    });
  }

  downloadCsv(): void {
    this.customerService.downloadCsv().subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'researchers.csv';
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: err => {
        this.showMessage(err, true);
      }
    });
  }

  getFacultyName(facultyId: any): string {
    if (!facultyId) {
      return 'N/A';
    }
    const faculty = this.faculties.find(f => f.id === facultyId);
    return faculty ? faculty.name : 'Unknown';
  }

  getDepartmentName(departmentId: any): string {
    if (!departmentId) {
      return 'N/A';
    }
    const department = this.departments.find(d => d.id === departmentId);
    return department ? department.name : 'Unknown';
  }

  onFacultyChange(facultyId: any): void {
    // Clear the selected department when faculty changes
    this.customer.department_id = undefined;
    // Filter departments based on selected faculty
    this.filteredDepartments = this.departments.filter(d => d.faculty_id == facultyId);
  }

//  getFacultyDepartmentIDs(facultyId: number): any[] {
//    return this.filteredDepartments;
//  }

  private showMessage(msg: string, isError: boolean): void {
    this.message = msg;
    this.isError = isError;

  // After 5 seconds, hide the message
  setTimeout(() => {
    this.message = '';  // Clear the message after 5 seconds
  }, 5000);
  }
  
}
