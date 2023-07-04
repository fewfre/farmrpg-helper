export namespace Asset {
	// uri conversion: https://dopiaza.org/tools/datauri/index.php

	// https://pixabay.com/sound-effects/finished-45049/
	export const SOUND_FINISHED = new Audio("data:audio/mpeg;base64,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XQDigEAQOE61LX5iKKY6TEFNRTMuMTAwqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq/+OIZAAAAAGkAOAAAAAAA0gBwAAATEFNRTMuMTAwqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqTEFNRTMuMTAwqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq");
}
