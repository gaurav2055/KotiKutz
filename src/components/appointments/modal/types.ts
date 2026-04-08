export type SelectedService = {
  id: string;
  name: string;
  price: number;
  duration: string;
  category: string;
};

export type BookingForm = {
  name: string;
  email: string;
  phone: string;
  location: string;     // display name
  locationId: string;   // UUID for DB
  gender: "Male" | "Female";
  services: SelectedService[];
  date: string;
  staffId: string;      // UUID or "" for any available
  staffName: string;    // display name
  timeSlot: string;
};
