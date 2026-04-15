"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Plus, Pencil, Trash2, X, Upload } from "lucide-react";
import Spinner from "@/components/ui/Spinner";
import Image from "next/image";
import AdminSelect from "@/components/ui/AdminSelect";
import AdminTable, { type ColumnDef } from "@/components/admin/AdminTable";
import AdminModal from "@/components/admin/AdminModal";
import TableImage from "@/components/admin/TableImage";

interface Offer {
	id: string;
	title: string;
	description: string | null;
	bullet_points: string[] | null;
	image_url: string | null;
	sort_order: number;
	active: boolean;
	location_id: string | null;
}

export default function OffersPage() {
	const { user } = useAuth();
	const [offers, setOffers] = useState<Offer[]>([]);
	const [locations, setLocations] = useState<{ label: string; value: string }[]>([]);
	const [role, setRole] = useState("");
	const [loading, setLoading] = useState(true);
	const [showForm, setShowForm] = useState(false);
	const [editTarget, setEditTarget] = useState<Offer | null>(null);
	const [saving, setSaving] = useState(false);
	const [pendingMsg, setPendingMsg] = useState("");
	const [uploading, setUploading] = useState(false);
	const fileRef = useRef<HTMLInputElement>(null);
	const [form, setForm] = useState({
		title: "",
		description: "",
		bullet_points: [""],
		image_url: "",
		sort_order: "0",
		active: true,
		location_id: "",
	});

	const fetchOffers = useCallback(async () => {
		setLoading(true);
		const res = await fetch("/api/admin/offers");
		const json = await res.json();
		setOffers(json.data ?? []);
		setLoading(false);
	}, []);

	useEffect(() => {
		if (!user) return;
		supabase
			.from("profiles")
			.select("role")
			.eq("id", user.id)
			.single()
			.then(({ data }) => setRole(data?.role ?? ""));
		fetchOffers();
		supabase
			.from("locations")
			.select("id, name")
			.then(({ data }) => {
				if (data) setLocations(data.map((l) => ({ label: l.name, value: l.id })));
			});
	}, [user, fetchOffers]);

	function openCreate() {
		setEditTarget(null);
		setForm({
			title: "",
			description: "",
			bullet_points: [""],
			image_url: "",
			sort_order: "0",
			active: true,
			location_id: "",
		});
		setPendingMsg("");
		setShowForm(true);
	}

	function openEdit(o: Offer) {
		setEditTarget(o);
		setForm({
			title: o.title,
			description: o.description ?? "",
			bullet_points: o.bullet_points?.length ? o.bullet_points : [""],
			image_url: o.image_url ?? "",
			sort_order: String(o.sort_order),
			active: o.active,
			location_id: o.location_id ?? "",
		});
		setPendingMsg("");
		setShowForm(true);
	}

	async function handleUpload(file: File, oldImageUrl: string | null) {
		setUploading(true);
		const prevPath = oldImageUrl
			? (oldImageUrl.split("/storage/v1/object/public/offers/")[1] ?? null)
			: null;
		const ext = file.name.split(".").pop();
		const fd = new FormData();
		fd.append("file", file);
		fd.append("bucket", "offers");
		if (editTarget) fd.append("path", `${editTarget.id}.${ext}`);
		if (prevPath) fd.append("prevPath", prevPath);
		const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
		const json = await res.json();
		if (json.url) setForm((f) => ({ ...f, image_url: json.url }));
		setUploading(false);
	}

	async function handleSave() {
		setSaving(true);
		const payload = {
			title: form.title,
			description: form.description || null,
			bullet_points: form.bullet_points.filter(Boolean),
			image_url: form.image_url || null,
			sort_order: parseInt(form.sort_order) || 0,
			active: form.active,
			location_id: form.location_id || null,
		};
		if (editTarget) {
			await fetch("/api/admin/offers", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ id: editTarget.id, ...payload }),
			});
			setShowForm(false);
			fetchOffers();
		} else {
			const res = await fetch("/api/admin/offers", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});
			const json = await res.json();
			if (json.pending) {
				setPendingMsg("Request submitted for approval.");
				fetchOffers();
			} else {
				setShowForm(false);
				fetchOffers();
			}
		}
		setSaving(false);
	}

	async function handleDelete(id: string) {
		const res = await fetch("/api/admin/offers", {
			method: "DELETE",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ id }),
		});
		const json = await res.json();
		if (json.pending) alert("Delete request submitted for approval.");
		fetchOffers();
	}

	const columns: ColumnDef<Offer>[] = [
		{
			label: "",
			headerClassName: "w-12",
			render: (o) =>
				o.image_url ? (
					<TableImage src={o.image_url} alt={o.title} />
				) : (
					<div className='w-9 h-9 rounded-md bg-white/5 flex items-center justify-center text-white/20 text-xs'>
						?
					</div>
				),
		},
		{
			label: "Title",
			render: (o) => (
				<>
					<p className='font-medium'>{o.title}</p>
					{o.description && (
						<p className='text-white/40 text-xs mt-0.5 line-clamp-1'>{o.description}</p>
					)}
				</>
			),
		},
		{
			label: "Location",
			render: (o) => (
				<span className='text-white/60'>
					{o.location_id
						? (locations.find((l) => l.value === o.location_id)?.label ?? "—")
						: "All"}
				</span>
			),
		},
		{ label: "Order", render: (o) => <span className='text-white/60'>{o.sort_order}</span> },
		{
			label: "Status",
			render: (o) => (
				<span
					className={`px-2 py-0.5 rounded-full text-xs ${o.active ? "bg-brand-green/20 text-brand-green" : "bg-white/10 text-white/40"}`}>
					{o.active ? "Active" : "Inactive"}
				</span>
			),
		},
		{
			label: "Actions",
			render: (o) => (
				<div className='flex gap-2'>
					{role === "super_admin" && (
						<button
							title="Edit offer"
							onClick={() => openEdit(o)}
							className='p-1.5 text-white/40 hover:text-white transition-colors'>
							<Pencil size={14} />
						</button>
					)}
					<button
						title="Delete offer"
						onClick={() => handleDelete(o.id)}
						className='p-1.5 text-red-400/60 hover:text-red-400 transition-colors'>
						<Trash2 size={14} />
					</button>
				</div>
			),
		},
	];

	const modalTitle = pendingMsg
		? "Request Submitted"
		: editTarget
			? "Edit Offer"
			: role === "manager"
				? "Request New Offer"
				: "Add Offer";

	if (loading)
		return (
			<div className='flex justify-center pt-20'>
				<Spinner size='lg' />
			</div>
		);

	return (
		<div>
			<div className='flex justify-end mb-4'>
				<button
					onClick={openCreate}
					className='flex items-center gap-2 px-4 py-2 bg-brand-green text-black text-sm font-medium rounded-lg hover:opacity-90'>
					<Plus size={16} /> {role === "manager" ? "Request New Offer" : "Add Offer"}
				</button>
			</div>

			<AdminTable
				columns={columns}
				rows={offers}
				keyExtractor={(o) => o.id}
				emptyMessage='No offers yet.'
				rowClassName={(o) => (!o.active ? "opacity-50" : "")}
			/>

			{showForm && (
				<AdminModal
					title={modalTitle}
					maxWidth='lg'
					onClose={() => setShowForm(false)}
					footer={
						pendingMsg ? (
							<button
								onClick={() => setShowForm(false)}
								className='w-full px-4 py-2 text-sm bg-white/10 text-white rounded-lg'>
								Close
							</button>
						) : (
							<div className='flex gap-3 justify-end'>
								<button
									onClick={() => setShowForm(false)}
									className='px-4 py-2 text-sm text-white/60 hover:text-white'>
									Cancel
								</button>
								<button
									onClick={handleSave}
									disabled={saving || uploading}
									className='px-4 py-2 text-sm bg-brand-green text-black rounded-lg hover:opacity-90 disabled:opacity-50'>
									{saving
										? "Saving…"
										: editTarget
											? "Save"
											: role === "manager"
												? "Submit Request"
												: "Add Offer"}
								</button>
							</div>
						)
					}>
					{pendingMsg ? (
						<p className='text-green-400 text-sm'>{pendingMsg}</p>
					) : (
						<>
							<div>
								<label className='text-white/60 text-sm block mb-1'>Title</label>
								<input
									value={form.title}
									onChange={(e) => setForm({ ...form, title: e.target.value })}
									className='w-full bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-2 outline-none [color-scheme:dark]'
								/>
							</div>
							<div>
								<label className='text-white/60 text-sm block mb-1'>
									Description
								</label>
								<textarea
									value={form.description}
									onChange={(e) =>
										setForm({ ...form, description: e.target.value })
									}
									rows={2}
									className='w-full bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-2 outline-none resize-none'
								/>
							</div>
							<div>
								<label className='text-white/60 text-sm block mb-1'>
									Bullet Points
								</label>
								{form.bullet_points.map((bp, i) => (
									<div key={i} className='flex gap-2 mb-2'>
										<input
											value={bp}
											onChange={(e) => {
												const next = [...form.bullet_points];
												next[i] = e.target.value;
												setForm({ ...form, bullet_points: next });
											}}
											className='flex-1 bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-2 outline-none'
											placeholder={`Point ${i + 1}`}
										/>
										<button
											onClick={() =>
												setForm({
													...form,
													bullet_points: form.bullet_points.filter(
														(_, j) => j !== i,
													),
												})
											}
											className='text-white/40 hover:text-red-400'>
											<X size={16} />
										</button>
									</div>
								))}
								<button
									onClick={() =>
										setForm({
											...form,
											bullet_points: [...form.bullet_points, ""],
										})
									}
									className='text-xs text-white/40 hover:text-white transition-colors'>
									+ Add point
								</button>
							</div>
							<div>
								<label className='text-white/60 text-sm block mb-1'>Location</label>
								<AdminSelect
									value={form.location_id}
									onChange={(v) => setForm({ ...form, location_id: v })}
									options={locations}
									placeholder='All Locations'
									className='w-full'
									emptyIsValid
								/>
							</div>
							<div>
								<label className='text-white/60 text-sm block mb-1'>Image</label>
								{form.image_url && (
									<div className='relative h-24 rounded-lg overflow-hidden mb-2 bg-white/5'>
										<Image
											src={form.image_url}
											alt='Preview'
											fill
											className='object-cover'
											unoptimized
										/>
									</div>
								)}
								<button
									onClick={() => fileRef.current?.click()}
									className='flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors'>
									<Upload size={14} />{" "}
									{uploading
										? "Uploading…"
										: form.image_url
											? "Change Image"
											: "Upload Image"}
								</button>
								<input
									ref={fileRef}
									type='file'
									accept='image/*'
									className='hidden'
									onChange={(e) => {
										if (e.target.files?.[0])
											handleUpload(
												e.target.files[0],
												editTarget?.image_url ?? null,
											);
									}}
								/>
							</div>
							<div className='grid grid-cols-2 gap-4'>
								<div>
									<label className='text-white/60 text-sm block mb-1'>
										Sort Order (Position of offer)
									</label>
									<input
										type='number'
										value={form.sort_order}
										onChange={(e) =>
											setForm({ ...form, sort_order: e.target.value })
										}
										className='w-full bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-2 outline-none [color-scheme:dark]'
									/>
								</div>
								<div className='flex items-end pb-2'>
									<label className='flex items-center gap-2 cursor-pointer'>
										<input
											type='checkbox'
											checked={form.active}
											onChange={(e) =>
												setForm({ ...form, active: e.target.checked })
											}
											className='accent-brand-green'
										/>
										<span className='text-white/60 text-sm'>Active</span>
									</label>
								</div>
							</div>
						</>
					)}
				</AdminModal>
			)}
		</div>
	);
}
