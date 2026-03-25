import { CalendarClock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const SERVICES_ICON = "/images/Services Icon.png";

const HERO_IMAGE = "/images/hero.jpg";

type Props = {
	title?: string;
	showServicesBtn?: boolean;
	showBookingBtn?: boolean;
};

export default function SiteHero({ title, showServicesBtn = true, showBookingBtn = true }: Props) {
	const hasButtons = showServicesBtn || showBookingBtn;

	return (
		<section className='relative h-[412px] overflow-hidden'>
			<Image
				src={HERO_IMAGE}
				alt={title ?? "KotiKutz Barbershop"}
				fill
				className='object-cover'
			/>

			{/* Dark overlay — only when a title is shown */}
			{title && <div className='absolute inset-0 bg-[rgba(41,41,41,0.85)]' />}

			{/* Centered title */}
			{title && (
				<div className='absolute inset-0 flex items-center justify-center pb-16'>
					<h1 className='font-algerian text-[64px] text-brand-green tracking-wide'>
						{title}
					</h1>
				</div>
			)}

			{hasButtons && (
				<div className='absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-16 pb-2'>
					{showServicesBtn && (
						<Link href='/services'>
							<div className='relative bg-brand-dark rounded-full w-[117px] h-[110px] overflow-hidden cursor-pointer hover:opacity-80 transition-opacity'>
								<Image
									src={SERVICES_ICON}
									alt='Services'
									fill
									className='object-contain'
								/>
							</div>
						</Link>
					)}

					{showBookingBtn && (
						<Link href='/appointments'>
							<div className='bg-brand-dark rounded-full w-[117px] h-[110px] flex flex-col items-center justify-center gap-1 cursor-pointer hover:opacity-80 transition-opacity'>
								<CalendarClock className='w-10 h-10 text-brand-green' />
								<span className='text-brand-green text-[11px] font-serif font-bold text-center leading-tight px-2'>
									Appointments
									<br />
									Booking
								</span>
							</div>
						</Link>
					)}
				</div>
			)}
		</section>
	);
}
