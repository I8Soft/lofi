import { useContext, useEffect, useState } from "react";
import { Stack, router } from "expo-router";
import QRCode from "react-native-qrcode-svg";
import {
	Button,
	ButtonText,
	Center,
	Checkbox,
	CheckboxIcon,
	CheckboxIndicator,
	CheckboxLabel,
	Heading,
	Text,
	VStack,
} from "@gluestack-ui/themed";

import { CurrentProfileContext } from "@/context/CurrentProfileContext";
import { LoginSessionContext } from "@/context/LoginSessionContext";

import Layout from "@/components/Layout";

export default function ProvideSync() {
	const { currentProfile } = useContext(CurrentProfileContext);
	const { loginSession } = useContext(LoginSessionContext);
	const [includeFullProfile, setIncludeFullProfile] = useState(true);
	const [frameIndex, setFrameIndex] = useState(0);
	const [frameCount, setFrameCount] = useState(0);
	const [qrCodeValue, setQrCodeValue] = useState<string>();

	useEffect(() => {
		const data = JSON.stringify({
			credentials: loginSession,
			...(includeFullProfile ? { profile: currentProfile } : {}),
		});

		// break the JSON string into 50-character chunks
		let frames = data.split(/([^]{50})/).filter(Boolean);
		const framesLen = frames.length;
		setFrameCount(framesLen);
		const frameLengthDigits = String(framesLen).length;

		// prepare frame chunks list with index/frame-count headers
		frames = frames.map(
			(text, idx) =>
				`${String(idx).padStart(
					frameLengthDigits,
					"0"
				)}:${framesLen}:${text.padEnd(50, " ")}`
		);
		setQrCodeValue(frames[frameIndex]);

		// Rotate to next frame after 250ms
		const id = setTimeout(() => {
			if (frameIndex >= frameCount) {
				setFrameIndex(0);
				return;
			}
			setFrameIndex(frameIndex + 1);
		}, 250);

		return () => clearTimeout(id);
	}, [
		currentProfile,
		loginSession,
		frameIndex,
		frameCount,
		includeFullProfile,
	]);

	return (
		<>
			<Stack.Screen options={{ headerTitle: "Provide Sync" }} />
			<Layout>
				<VStack space="lg">
					<Heading color="$white" size="2xl">
						Provide Sync
					</Heading>

					<Checkbox
						aria-label="Include full profile"
						isChecked={includeFullProfile}
						value=""
						size="lg"
						onPress={() =>
							setIncludeFullProfile(!includeFullProfile)
						}
					>
						<CheckboxIndicator mr="$2">
							{/* <CheckboxIcon as={CheckIcon}/> */}
						</CheckboxIndicator>

						<CheckboxLabel color="$white">
							Include full profile
						</CheckboxLabel>
					</Checkbox>

					<Text size="lg" color="$white">
						Frame: {frameIndex} / {frameCount}
					</Text>

					<Center bg="$white" h={350} borderRadius="$md">
						<QRCode
							value={qrCodeValue}
							size={300}
							logo={{
								uri: "https://localfirstweb.dev/assets/images/logo.png",
							}}
						/>
					</Center>

					<Button onPress={() => router.navigate("/(app)")}>
						<ButtonText>Done</ButtonText>
					</Button>
				</VStack>
			</Layout>
		</>
	);
}