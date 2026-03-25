export type SelectedService = {
  id: number;
  name: string;
  price: number;
  duration: string;
  category: string;
};

export type BookingForm = {
  name: string;
  email: string;
  phone: string;
  location: string;
  gender: "Male" | "Female";
  services: SelectedService[];
  date: string;
  stylist: string;
  timeSlot: string;
};
