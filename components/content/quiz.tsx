import type { ReactNode } from "react";

interface QuizProps {
	children: ReactNode;
}

export function Quiz(props: QuizProps): ReactNode {
	return null;
}

interface QuizChoiceProps {
	buttonLabel?: string;
	children: ReactNode;
	variant: "single" | "multiple";
}

export function QuizChoice(props: QuizChoiceProps): ReactNode {
	return null;
}

interface QuizChoiceAnswerProps {
	children: ReactNode;
	kind: "correct" | "incorrect";
}

export function QuizChoiceAnswer(props: QuizChoiceAnswerProps): ReactNode {
	return null;
}

interface QuizChoiceQuestionProps {
	children: ReactNode;
}

export function QuizChoiceQuestion(props: QuizChoiceQuestionProps): ReactNode {
	return null;
}

interface QuizErrorMessageProps {
	children: ReactNode;
}

export function QuizErrorMessage(props: QuizErrorMessageProps): ReactNode {
	return null;
}

interface QuizSuccessMessageProps {
	children: ReactNode;
}

export function QuizSuccessMessage(props: QuizSuccessMessageProps): ReactNode {
	return null;
}

interface QuizTextInputProps {
	children: ReactNode;
}

export function QuizTextInput(props: QuizTextInputProps): ReactNode {
	return null;
}
