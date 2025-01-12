import { withI18nPrefix } from "@acdh-oeaw/keystatic-lib";
import { config } from "@keystatic/core";

import { Logo } from "@/components/logo";
import { env } from "@/config/env.config";
import { defaultLocale } from "@/config/i18n.config";
import {
	createCurricula,
	createDocumentation,
	createEvents,
	createResources,
	createSources,
	createPeople,
	createTags,
} from "@/lib/keystatic/collections";
import { createIndexPage, createMetadata, createNavigation } from "@/lib/keystatic/singletons";

export default config({
	collections: {
		[withI18nPrefix("curricula", defaultLocale)]: createCurricula(defaultLocale),
		[withI18nPrefix("documentation", defaultLocale)]: createDocumentation(defaultLocale),
		[withI18nPrefix("events", defaultLocale)]: createEvents(defaultLocale),
		[withI18nPrefix("people", defaultLocale)]: createPeople(defaultLocale),
		[withI18nPrefix("resources", defaultLocale)]: createResources(defaultLocale),
		[withI18nPrefix("sources", defaultLocale)]: createSources(defaultLocale),
		[withI18nPrefix("tags", defaultLocale)]: createTags(defaultLocale),
	},
	singletons: {
		[withI18nPrefix("index-page", defaultLocale)]: createIndexPage(defaultLocale),
		[withI18nPrefix("metadata", defaultLocale)]: createMetadata(defaultLocale),
		// [withI18nPrefix("navigation", defaultLocale)]: createNavigation(defaultLocale),
	},
	storage:
		env.NEXT_PUBLIC_KEYSTATIC_MODE === "github" &&
		env.NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO_OWNER &&
		env.NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO_NAME
			? {
					kind: "github",
					repo: {
						owner: env.NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO_OWNER,
						name: env.NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO_NAME,
					},
					branchPrefix: "content/",
				}
			: {
					kind: "local",
				},
	ui: {
		brand: {
			mark() {
				return <Logo />;
			},
			name: "DARIAH Campus",
		},
		navigation: {
			Content: [
				withI18nPrefix("resources", defaultLocale),
				withI18nPrefix("events", defaultLocale),
				withI18nPrefix("curricula", defaultLocale),
				withI18nPrefix("sources", defaultLocale),
			],
			Data: [withI18nPrefix("people", defaultLocale), withI18nPrefix("tags", defaultLocale)],
			Pages: [
				withI18nPrefix("index-page", defaultLocale),
				withI18nPrefix("documentation", defaultLocale),
			],
			Metadata: [
				// withI18nPrefix("navigation", defaultLocale),
				withI18nPrefix("metadata", defaultLocale),
			],
		},
	},
});
