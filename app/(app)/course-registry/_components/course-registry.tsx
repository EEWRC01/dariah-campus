"use client";

import { LoadingIndicator } from "@/components/loading-indicator";
import { useState, type ReactNode } from "react";

export function CourseRegistry(): ReactNode {
	const [isLoading, setIsLoading] = useState(true);

	function onLoad() {
		setIsLoading(false);
	}

	return (
		<div className="relative">
			{isLoading ? (
				<div className="absolute inset-0 grid place-content-center">
					<LoadingIndicator />
				</div>
			) : null}
			<iframe
				src="https://dhcr.clarin-dariah.eu?parent_domain=dariah.eu"
				title="Course registry"
				loading="lazy"
				className="relative size-full"
				onLoad={onLoad}
				sandbox=""
			/>
		</div>
	);
}
