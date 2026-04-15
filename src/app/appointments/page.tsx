"use client";

import { useEffect, useState } from "react";

import AdminSelect from "@/components/ui/AdminSelect";
import AppointmentCard from "@/components/appointments/AppointmentCard";
import type { AppointmentStatus } from "@/components/appointments/AppointmentCard";
import type { AppointmentTab } from "@/components/appointments/AppointmentTabs";
import AppointmentTabs from "@/components/appointments/AppointmentTabs";
import BookAppointmentModal from "@/components/appointments/BookAppointmentModal";
import CancelAppointmentModal from "@/components/appointments/CancelAppointmentModal";
import RescheduleModal from "@/components/appointments/RescheduleModal";
import Spinner from "@/components/ui/Spinner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

type RawAppointment = {
	id: string;
	appointment_date: string;
	time_slot: string;
	status: string;
	total_price: number | null;
	staff_id: string | null;
	locations: { id: string; name: string } | null;
	staff: { profiles: { name: string | null; first_name: string | null; last_name: string | null } | null } | null;
	appointment_services: Array<{ services: { name: string } | null }>;
};

type Appointment = {
	id: string;
	date: string; // raw "YYYY-MM-DD" for reschedule
	dayNum: string;
	monthYear: string;
	dayLabel: string;
	service: string;
	location: string;
	locationId: string;
	staffId: string | null;
	stylist: string;
	time: string;
	status: AppointmentStatus;
	price: string;
	tab: AppointmentTab;
};

function formatDate(dateStr: string) {
	const d = new Date(dateStr.split("T")[0] + "T00:00:00"); // local midnight, avoids UTC shift
	return {
		dayNum: d.getDate().toString().padStart(2, "0"),
		monthYear: d.toLocaleDateString("en-GB", { month: "short", year: "numeric" }).toUpperCase(),
		dayLabel: d.toLocaleDateString("en-GB", {
			weekday: "short",
			day: "numeric",
			month: "short",
			year: "numeric",
		}),
	};
}

function statusToTab(status: AppointmentStatus, date: string): AppointmentTab {
	if (status === "cancelled") return "cancelled";
	if (status === "completed") return "past";
	// pending/confirmed: if date has passed it was missed, otherwise upcoming
	const today = new Date().toISOString().split("T")[0];
	return date < today ? "missed" : "upcoming";
}

export default function AppointmentsPage() {
	const { user, loading } = useAuth();

	const [appointments, setAppointments] = useState<Appointment[]>([]);
	const [locations, setLocations] = useState<{ label: string; value: string }[]>([]);
	const [activeTab, setActiveTab] = useState<AppointmentTab>("upcoming");
	const [location, setLocation] = useState("");
	const [fetching, setFetching] = useState(false);

	// Modal state
	const [bookingOpen, setBookingOpen] = useState(false);
	const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null);
	const [rescheduleTarget, setRescheduleTarget] = useState<Appointment | null>(null);

	useEffect(() => {
		supabase
			.from("locations")
			.select("id, name")
			.then(({ data }) => {
				if (data) setLocations(data.map((l) => ({ label: l.name, value: l.id })));
			});
	}, []);

	useEffect(() => {
		async function load() {
			if (!user) { setFetching(false); return; }
			setFetching(true);
			const { data } = await supabase
				.from("appointments")
				.select(
					`
          id, appointment_date, time_slot, status, total_price, staff_id,
          locations(id, name),
          staff(profiles!staff_id_fkey(name, first_name, last_name)),
          appointment_services(services(name))
        `,
				)
				.eq("user_id", user.id)
				.order("appointment_date", { ascending: false });

			if (!data) { setFetching(false); return; }

			const mapped: Appointment[] = (data as unknown as RawAppointment[]).map((a) => {
				const { dayNum, monthYear, dayLabel } = formatDate(a.appointment_date);
				const serviceNames =
					a.appointment_services
						?.map((as) => as.services?.name)
						.filter(Boolean)
						.join(" + ") ?? "";
				const status = (
					a.status === "no_show" ? "missed" : a.status
				) as AppointmentStatus;
				return {
					id: a.id,
					date: a.appointment_date,
					dayNum,
					monthYear,
					dayLabel,
					service: serviceNames,
					location: a.locations?.name ?? "",
					locationId: a.locations?.id ?? "",
					staffId: a.staff_id ?? null,
					stylist: (() => { const p = a.staff?.profiles; return p?.first_name ? `${p.first_name} ${p.last_name ?? ""}`.trim() : p?.name ?? "Any Available"; })(),
					time: a.time_slot,
					status,
					price: `₹${a.total_price ?? 0}`,
					tab: statusToTab(status, a.appointment_date),
				};
			});
			setAppointments(mapped);
			setFetching(false);
		}
		load();
	}, [user, bookingOpen]);

	// ── Cancel ──────────────────────────────────────────────────────────────────

	async function handleCancelConfirm() {
		if (!cancelTarget || !user) return;
		const res = await fetch(`/api/appointments/${cancelTarget.id}`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ userId: user.id, action: "cancel" }),
		});
		if (!res.ok) throw new Error();
		setAppointments((prev) =>
			prev.map((a) =>
				a.id === cancelTarget.id ? { ...a, status: "cancelled", tab: "cancelled" } : a,
			),
		);
		setCancelTarget(null);
	}

	// ── Reschedule ──────────────────────────────────────────────────────────────

	function handleRescheduled(updated: {
		locationId: string;
		locationName: string;
		date: string;
		timeSlot: string;
		staffId: string | null;
		staffName: string;
	}) {
		if (!rescheduleTarget) return;
		const { dayNum, monthYear, dayLabel } = formatDate(updated.date);
		setAppointments((prev) =>
			prev.map((a) =>
				a.id === rescheduleTarget.id
					? {
							...a,
							locationId: updated.locationId,
							location: updated.locationName,
							date: updated.date,
							dayNum,
							monthYear,
							dayLabel,
							time: updated.timeSlot,
							staffId: updated.staffId,
							stylist: updated.staffName,
							tab: statusToTab(a.status, updated.date),
						}
					: a,
			),
		);
		setRescheduleTarget(null);
	}

	// ── Derived state ───────────────────────────────────────────────────────────

	const filtered = appointments.filter(
		(a) => a.tab === activeTab && (location === "" || a.locationId === location),
	);

	const upcomingCount = appointments.filter((a) => a.tab === "upcoming").length;
	const totalCount = appointments.length;
	const completedCount = appointments.filter((a) => a.status === "completed").length;

	if (loading) return null;

	return (
		<main className='max-w-[1440px] mx-auto px-4 md:px-16 py-8 md:py-12'>
			{/* Page title */}
			<div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-8'>
				<div>
					<h1 className='text-3xl md:text-4xl font-bold text-black'>My Appointments</h1>
					<p className='text-gray-500 mt-1'>Manage and track all your bookings</p>
				</div>
				<button
					onClick={() => setBookingOpen(true)}
					className='bg-brand-dark text-white px-5 py-3 rounded-[10px] text-sm font-medium hover:opacity-80 transition-opacity w-full sm:w-auto shrink-0'>
					+ Book Appointment
				</button>
			</div>

			{user ? (
				<>
					{/* Stats */}
					<div className='grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8'>
						{[
							{ label: "Total Bookings", value: totalCount, sub: "All time bookings" },
							{ label: "Upcoming", value: upcomingCount, sub: "Appointments scheduled" },
							{ label: "Completed", value: completedCount, sub: "Completed appointments" },
						].map((s) => (
							<div
								key={s.label}
								className='relative border border-gray-200 rounded-[10px] p-5 overflow-hidden'>
								<p className='text-sm text-gray-500 mb-1'>{s.label}</p>
								<p className='text-3xl font-bold text-black mb-1'>{s.value}</p>
								<p className='text-sm text-gray-500'>{s.sub}</p>
								<div className='absolute bottom-0 left-0 right-0 h-1 bg-brand-green' />
							</div>
						))}
					</div>

					{/* Tabs */}
					<AppointmentTabs
						active={activeTab}
						onChange={setActiveTab}
						upcomingCount={upcomingCount}
					/>

					{/* Location filter */}
					<div className='mb-5'>
						<AdminSelect
							value={location}
							onChange={setLocation}
							options={locations}
							placeholder='All Locations'
							variant='light'
							className='w-full sm:w-48'
						/>
					</div>

					{/* Appointment list */}
					{fetching ? (
						<div className='flex justify-center py-16'>
							<Spinner size='lg' label='Loading appointments…' />
						</div>
					) : filtered.length === 0 ? (
						<p className='text-gray-400 text-sm py-12 text-center'>No appointments found.</p>
					) : (
						filtered.map((a) => (
							<AppointmentCard
								key={a.id}
								{...a}
								onBookAgain={() => setBookingOpen(true)}
								onCancel={() => setCancelTarget(a)}
								onReschedule={() => setRescheduleTarget(a)}
							/>
						))
					)}
				</>
			) : (
				<p className='text-gray-400 text-sm py-12 text-center'>
					Login to view and manage your appointments.
				</p>
			)}

			{/* Book new appointment modal */}
			{bookingOpen && <BookAppointmentModal onClose={() => setBookingOpen(false)} />}

			{/* Cancel confirmation modal */}
			{cancelTarget && (
				<CancelAppointmentModal
					service={cancelTarget.service}
					dayLabel={cancelTarget.dayLabel}
					location={cancelTarget.location}
					onClose={() => setCancelTarget(null)}
					onConfirm={handleCancelConfirm}
				/>
			)}

			{/* Reschedule modal */}
			{rescheduleTarget && user && (
				<RescheduleModal
					appointmentId={rescheduleTarget.id}
					locationId={rescheduleTarget.locationId}
					locationName={rescheduleTarget.location}
					currentDate={rescheduleTarget.date}
					currentTimeSlot={rescheduleTarget.time}
					currentStaffId={rescheduleTarget.staffId}
					userId={user.id}
					onClose={() => setRescheduleTarget(null)}
					onRescheduled={handleRescheduled}
				/>
			)}
		</main>
	);
}
