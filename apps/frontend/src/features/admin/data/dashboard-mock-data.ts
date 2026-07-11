import type { DashboardStats } from '../types';

/**
 * Static sample data for the admin dashboard — there is no backend
 * aggregation endpoint yet. Shaped exactly like `DashboardStats` so that
 * wiring up a real `GET /dashboard/stats` later is a hook-internals swap,
 * not a reshape of every component that consumes it. Every enumerable
 * breakdown (status, vehicle type) sums to its matching total; "top N"
 * breakdowns (specialization) don't, by design — real long-tail data
 * wouldn't either.
 */
export const MOCK_DASHBOARD_STATS: DashboardStats = {
  generatedAt: '2026-07-01T09:00:00.000Z',
  totals: {
    doctors: 74,
    drivers: 28,
    vehicles: 22,
    activeAssignments: 19,
  },
  doctorStatusBreakdown: [
    { status: 'AVAILABLE', label: 'Available', count: 58, variant: 'success' },
    { status: 'ON_LEAVE', label: 'On leave', count: 9, variant: 'warning' },
    { status: 'UNAVAILABLE', label: 'Unavailable', count: 7, variant: 'danger' },
  ],
  driverStatusBreakdown: [
    { status: 'AVAILABLE', label: 'Available', count: 12, variant: 'success' },
    { status: 'ASSIGNED', label: 'Assigned', count: 10, variant: 'info' },
    { status: 'OFF_DUTY', label: 'Off duty', count: 4, variant: 'neutral' },
    { status: 'ON_LEAVE', label: 'On leave', count: 2, variant: 'warning' },
  ],
  vehicleStatusBreakdown: [
    { status: 'AVAILABLE', label: 'Available', count: 9, variant: 'success' },
    { status: 'ASSIGNED', label: 'Assigned', count: 6, variant: 'info' },
    { status: 'ON_TRIP', label: 'On trip', count: 3, variant: 'primary' },
    { status: 'MAINTENANCE', label: 'Maintenance', count: 3, variant: 'warning' },
    { status: 'INACTIVE', label: 'Inactive', count: 1, variant: 'neutral' },
  ],
  doctorsByDepartment: [
    { label: 'Cardiology', count: 14 },
    { label: 'Orthopedics', count: 12 },
    { label: 'Neurology', count: 11 },
    { label: 'Pediatrics', count: 10 },
    { label: 'General Medicine', count: 9 },
    { label: 'Emergency Medicine', count: 8 },
    { label: 'Gynecology', count: 6 },
    { label: 'Dermatology', count: 4 },
  ],
  doctorsBySpecialization: [
    { label: 'Interventional Cardiology', count: 9 },
    { label: 'Orthopedic Surgery', count: 8 },
    { label: 'General Neurology', count: 7 },
    { label: 'Pediatric Care', count: 7 },
    { label: 'Emergency Trauma', count: 6 },
    { label: 'Gynecologic Care', count: 5 },
  ],
  doctorsByCity: [
    { label: 'Mumbai', count: 16 },
    { label: 'Pune', count: 12 },
    { label: 'Bengaluru', count: 11 },
    { label: 'Chennai', count: 9 },
    { label: 'Hyderabad', count: 8 },
    { label: 'Kolkata', count: 7 },
    { label: 'Other', count: 11 },
  ],
  vehiclesByType: [
    { label: 'Basic Ambulance', count: 9 },
    { label: 'Advanced Ambulance', count: 7 },
    { label: 'ICU Ambulance', count: 4 },
    { label: 'Neonatal Ambulance', count: 2 },
  ],
  complianceAlerts: [
    {
      id: 'c1',
      type: 'Pollution',
      entityName: 'Tata Winger · DL8CAF5566',
      entityType: 'vehicle',
      expiresOn: '2026-07-16',
      daysRemaining: 5,
      severity: 'danger',
    },
    {
      id: 'c2',
      type: 'Insurance',
      entityName: 'Force Traveller · MH12AB1234',
      entityType: 'vehicle',
      expiresOn: '2026-07-23',
      daysRemaining: 12,
      severity: 'danger',
    },
    {
      id: 'c3',
      type: 'License',
      entityName: 'Rohan Mehta',
      entityType: 'driver',
      expiresOn: '2026-07-29',
      daysRemaining: 18,
      severity: 'danger',
    },
    {
      id: 'c4',
      type: 'Fitness',
      entityName: 'Maruti Eeco · KA05MZ7788',
      entityType: 'vehicle',
      expiresOn: '2026-08-07',
      daysRemaining: 27,
      severity: 'warning',
    },
    {
      id: 'c5',
      type: 'Insurance',
      entityName: 'Force Traveller · TN09BZ4321',
      entityType: 'vehicle',
      expiresOn: '2026-08-22',
      daysRemaining: 42,
      severity: 'warning',
    },
    {
      id: 'c6',
      type: 'License',
      entityName: 'Pooja Patel',
      entityType: 'driver',
      expiresOn: '2026-09-04',
      daysRemaining: 55,
      severity: 'warning',
    },
  ],
  monthlyTrend: [
    { month: 'Feb', doctors: 52, drivers: 18, vehicles: 15 },
    { month: 'Mar', doctors: 58, drivers: 20, vehicles: 17 },
    { month: 'Apr', doctors: 63, drivers: 22, vehicles: 18 },
    { month: 'May', doctors: 67, drivers: 24, vehicles: 19 },
    { month: 'Jun', doctors: 70, drivers: 26, vehicles: 21 },
    { month: 'Jul', doctors: 74, drivers: 28, vehicles: 22 },
  ],
};
