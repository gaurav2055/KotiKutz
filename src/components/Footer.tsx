"use client";

import Link from "next/link";
import Image from "next/image";
import { Phone, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const LOGO = "/logo.png";

type Location = { id: string; name: string };

export default function Footer() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [phone,     setPhone]     = useState("+919820571506");
  const [email,     setEmail]     = useState("jaygauravs@gmail.com");

  useEffect(() => {
    supabase.from("locations").select("id, name").order("name").then(({ data }) => {
      if (data) setLocations(data);
    });

    supabase
      .from("site_content")
      .select("key, value")
      .in("key", ["contact_phone", "contact_email"])
      .then(({ data }) => {
        data?.forEach((row) => {
          if (row.key === "contact_phone" && row.value) setPhone(row.value);
          if (row.key === "contact_email" && row.value) setEmail(row.value);
        });
      });
  }, []);

  return (
    <footer className="bg-brand-dark text-white w-full">
      <div className="max-w-[1440px] mx-auto px-10 pt-12 pb-6">

        {/* Top Section: Logo, Locations, Contact */}
        <div className="flex justify-between mb-12">

          {/* Logo */}
          <Image src={LOGO} alt="KotiKutz" width={124} height={47} className="object-contain self-start" />

          {/* Locations */}
          <div>
            <p className="text-brand-green text-2xl mb-4">Location</p>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-base text-brand-green">
              {locations.map((loc) => (
                <span key={loc.id}>{loc.name}</span>
              ))}
            </div>
          </div>

          {/* Contact Details */}
          <div>
            <p className="text-brand-green text-2xl mb-4">Contact Details</p>
            <div className="flex items-center gap-2 text-brand-green mb-2">
              <Phone className="w-5 h-5 shrink-0" />
              <span>{phone}</span>
            </div>
            <div className="flex items-center gap-2 text-brand-green">
              <Mail className="w-5 h-5 shrink-0" />
              <span>{email}</span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <hr className="border-white mb-6" />

        {/* Bottom Navigation */}
        <div className="flex justify-center gap-16 text-white text-xl">
          <Link href="/"             className="hover:text-brand-green transition-colors">Home</Link>
          <Link href="/about"        className="hover:text-brand-green transition-colors">About Us</Link>
          <Link href="/services"     className="hover:text-brand-green transition-colors">Services</Link>
          <Link href="/appointments" className="hover:text-brand-green transition-colors">Book Appointment</Link>
          <Link href="/testimonials" className="hover:text-brand-green transition-colors">Testimonials</Link>
          <Link href="/login"        className="hover:text-brand-green transition-colors">Login</Link>
        </div>

      </div>
    </footer>
  );
}
