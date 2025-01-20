import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { LoadingIndicator } from "@/components/loading-indicator";
import { MainContent } from "@/components/main-content";

export default function Loading(): ReactNode {
	const t = useTranslations("Loading");

	return (
		<MainContent className="min-h-[calc(100vh-100px)]">
			<section className="grid h-full place-content-center place-items-center py-16 xs:py-24 ">
				<LoadingIndicator aria-label={t("loading")} />
			</section>
		</MainContent>
	);
}
