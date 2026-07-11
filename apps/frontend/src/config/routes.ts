/** Central route table — no magic path strings in components or the router. */
export const ROUTES = {
  home: '/',
  login: '/login',
  admin: {
    root: '/admin',
    doctors: '/admin/doctors',
    drivers: '/admin/drivers',
    vehicles: '/admin/vehicles',
  },
} as const;
