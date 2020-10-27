// stores what decision the player has made
var playerState = {
	level: 'none',
	question: 'question',
	// upOrDown: undefined,
	// darkOrJoy: undefined,
	// chaosOrGentle: undefined,
	// forestOrMeadow: undefined,
	// outOrIn: undefined,
	// morningOrNight: undefined,
	// unfoldOrCyle: undefined,
	// numQuestionsAnswered: 0,
	q1: undefined,
	q2: undefined,
	q3: undefined,
	song: undefined
};

const songMap = {
	'chaos': {
		artist: 'Klapschmock',
		title: 'Attack Zone X',
		file: 'Klapshmock-AttackZoneX.mp3'
	},
	'gentle': {
		artist: 'Deidre',
		title: 'Numb',
		file: 'Deidre-Numb.mp3'
	},
	'forest': {
		artist: 'Mas Aya',
		title: 'AGAKHAN',
		file: 'MasAya-AGAKHAN.mp3'
	},
	'meadow': {
		artist: 'Orchidae',
		title: 'Love Demo',
		file: 'Orchidae-LoveDemo.mp3',
	},
	'morning': {
		artist: 'Century Egg',
		title: 'I Will Make Up A Method',
		file: 'CenturyEgg-IWillMakeUpAMethod.mp3'
	},
	'night': {
		artist: 'Slow Pitch Sound',
		title: 'You Betta Change ft. Distant Dust',
		file: 'SlowPitchSound-YouBettaChangeftDistantDust.mp3'
	},
	'unfold': {
		artist: 'Melody McKiver, Thomas Goguelin',
		title: 'Berlinale Duet',
		file: 'MelodyMcKiver_ThomasGoguelin-BerlinaleDuet.mp3'
	},
	'cycle': {
		artist: 'Bucko',
		title: 'Pro Testing',
		file: 'Bucko-ProTesting.mp3'
	}
}

// get each "level"
function windowOnLoad() {
	const beginLvl = document.getElementById('beginLvl');
	const playerQuestionLvl = document.getElementById('playerQuestionLvl');
	const questions3Lvl = document.getElementById('questions3Lvl');
	const choice1Lvl = document.getElementById('choice1Lvl');
	const upLvl = document.getElementById('upLvl');
	const downLvl = document.getElementById('downLvl');
	const darkLvl = document.getElementById('darkLvl');
	const joyLvl = document.getElementById('joyLvl');
	const outLvl = document.getElementById('outLvl');
	const innerLvl = document.getElementById('innerLvl');
	const findSongLvl = document.getElementById('findSongLvl');
	const lastLvl = document.getElementById('lastLvl');
	const creditsLvl = document.getElementById('creditsLvl');

	const spacer0 = document.getElementById('spacer0');
	const spacer1 = document.getElementById('spacer1');
	const spacer2 = document.getElementById('spacer2');
	const spacer3 = document.getElementById('spacer3');
	const spacer4 = document.getElementById('spacer4');
	const spacer5 = document.getElementById('spacer5');
	const spacer6 = document.getElementById('spacer6');
	// const spacer7 = document.getElementById('spacer7');

	// set each level to be invisible
	playerQuestionLvl.style.display = "none";
	questions3Lvl.style.display = "none";
	choice1Lvl.style.display = "none";
	upLvl.style.display = "none";
	downLvl.style.display = "none";
	darkLvl.style.display = "none";
	joyLvl.style.display = "none";
	outLvl.style.display = "none";
	innerLvl.style.display = "none";
	findSongLvl.style.display = "none";
	lastLvl.style.display = "none";
	creditsLvl.style.display = "none";

	spacer0.style.display = "none";
	spacer1.style.display = "none";
	spacer2.style.display = "none";
	spacer3.style.display = "none";
	spacer4.style.display = "none";
	spacer5.style.display = "none";
	spacer6.style.display = "none";
	// spacer7.style.display = "none";

	var beginBtn = document.getElementById('beginBtn'); // get the button
	beginBtn.addEventListener('click', beginBtnButtonHandler); // add an eventlistener to the enter button
	function beginBtnButtonHandler(event) {  // set the begin to visible when you click on the enter button
		// window.location.hash='question'; // transport down the page
		playerQuestionLvl.style.display = "grid";
		spacer0.style.display = "grid";
		playSound(beginSound);
		playSound(backgroundMusic);
		beginBtn.innerHTML = 'scroll';
	}

	const seekText = document.getElementById('seekText');
	const seekBtn = document.getElementById('seekBtn');

	seekBtn.addEventListener('click', questionBtnHandler); // add an eventlistener to the  button
	function questionBtnHandler(event) {
		playerState.question = seekText.value;
		playSound(beginSound);
		seekBtn.innerHTML = 'received';
		seekText.classList.add('fade');
		questions3Lvl.style.display = "grid";
		spacer1.style.display = "grid";
		spacer2.style.display = "grid";
		choice1Lvl.style.display = "grid";
		displayPlayerQuestion();
	}

	var findSongBtn = document.getElementById('findSongBtn');

	findSongBtn.addEventListener('click', findSongBtnButtonHandler); 
	function findSongBtnButtonHandler(event) { 
		spacer6.style.display = "grid"; 
		lastLvl.style.display = "grid";
		creditsLvl.style.display = 'grid';
		playSound(beginSound);
		findSongBtn.innerHTML = 'scroll'; 
		backgroundMusic.pause();
	}

	function displayPlayerQuestion() {
		var x = document.getElementsByClassName("playerQuestion");
		var i;
		for (i = 0; i < x.length; i++) {
			x[i].innerHTML = playerState.question;
		}
	}

	// get all the links
	const upLink = document.getElementById('upLink');
	const downLink = document.getElementById('downLink');
	const darkLink = document.getElementById('darkLink');
	const joyLink = document.getElementById('joyLink');
	const chaosLink = document.getElementById('chaosLink');
	const gentleLink = document.getElementById('gentleLink');
	const forestLink = document.getElementById('forestLink');
	const meadowLink = document.getElementById('meadowLink');
	const outLink = document.getElementById('outLink');
	const innerLink = document.getElementById('innerLink');
	const morningLink = document.getElementById('morningLink');
	const nightLink = document.getElementById('nightLink');
	const unfoldLink = document.getElementById('unfoldLink');
	const cycleLink = document.getElementById('cycleLink');
	// get all the images
	const upImg = document.getElementById('upImg');
	const downImg = document.getElementById('downImg');
	const darkImg = document.getElementById('darkImg');
	const joyImg = document.getElementById('joyImg');
	const chaosImg = document.getElementById('chaosImg');
	const gentleImg = document.getElementById('gentleImg');
	const forestImg = document.getElementById('forestImg');
	const meadowImg = document.getElementById('meadowImg');
	const outImg = document.getElementById('outImg');
	const innerImg = document.getElementById('innerImg');
	const morningImg = document.getElementById('morningImg');
	const nightImg = document.getElementById('nightImg');
	const unfoldImg = document.getElementById('unfoldImg');
	const cycleImg = document.getElementById('cycleImg');

	// MUSIC 
	const backgroundMusic = new Audio("./sounds/backgroundMusic.mp3");
	backgroundMusic.load();
	backgroundMusic.loop = true;

	const beginSound = new Audio("./sounds/beginSound.mp3");
	beginSound.load();
	const genSound = new Audio("./sounds/genSound.mp3");
	genSound.load();

	function playSound(audio) {
		audio.play();
	}

	function renderSong(playerState) {
		if (playerState.q3 === undefined) {
			return;
		}
		var song = songMap[playerState.q3];
		// console.log(`the song is: ${JSON.stringify(song)}`);

		var audioSrc = document.getElementById('audioSource');
		audioSrc.setAttribute('src', `sounds/${song.file}`);

		var artistText = document.getElementById('artist');
		artistText.textContent = song.artist;

		var titleText = document.getElementById('title');
		titleText.textContent = song.title;

		// force the browser to refresh the audio source
		var audio = document.getElementById('player1');
		audio.load();
	}

	// draws the final images based on playerState
	function renderplayerState(playerState) {
		var finalImageRow = document.getElementById("finalImageRow");
		// clear images inside <div> so you can add new ones
		finalImageRow.innerHTML = '';

		if (playerState.q1 !== undefined) {
			const img = document.createElement('img');
			img.setAttribute('src', `images/choices/${playerState.q1}.png`);
			img.setAttribute('class', 'finalImage');
			finalImageRow.appendChild(img);
		}

		if (playerState.q2 !== undefined) {
			const img = document.createElement('img');
			img.setAttribute('src', `images/choices/${playerState.q2}.png`);
			img.setAttribute('class', 'finalImage');
			finalImageRow.appendChild(img);
		}

		if (playerState.q3 !== undefined) {
			const img = document.createElement('img');
			img.setAttribute('src', `images/choices/${playerState.q3}.png`);
			img.setAttribute('class', 'finalImage');
			finalImageRow.appendChild(img);
		}
		console.log('render player state');
	}

	// called when the links are clicked
	function makeLinkHandler(link, stateKey, chosenValue, unchosenValue, level, spacer) {
		function linkHandler(event) {
			event.preventDefault()

			playSound(genSound);

			const chosenImageId = chosenValue+"Img"; 
			const chosenImageDOM = document.getElementById(chosenImageId);
			chosenImageDOM.classList.add('glow');

			console.log(stateKey);

			const chosenTextId = stateKey+"Text";
			const textDom = document.getElementById(chosenTextId);

			const chosenTextPhrase = chosenValue+"Link";
			const textPhrase = document.getElementById(chosenTextPhrase).innerHTML;
			// console.log(textDom);
			textDom.innerHTML = textPhrase;
			textDom.classList.add('glow');


			const unchosenImageId = unchosenValue+"Img";
			const unchosenImageDOM = document.getElementById(unchosenImageId);
			unchosenImageDOM.classList.add('fade');

			// const unchosenTextId = unchosenValue+"Link";
			// const unchosenTextDOM = document.getElementById(unchosenTextId);
			// unchosenTextDOM.classList.add('fade');

			link.style.display = "grid";
			spacer.style.display = "grid";

			playerState[stateKey] = chosenValue;
			console.log(JSON.stringify(playerState))
			if (level === 1) {
				playerState.q1 = chosenValue;
				// only re-render if they've answered all the questions
				renderplayerState(playerState);
				renderSong(playerState);
			} else if (level === 2) {
				playerState.q2 = chosenValue;
				renderplayerState(playerState);
				renderSong(playerState);
			} else if (level === 3) {
				playerState.q3 = chosenValue;
				renderplayerState(playerState);
				renderSong(playerState);
			}
		}
		return linkHandler;
	}

	//creates and runs a function makeLinkHandler which returns a function
	upLink.addEventListener('click', makeLinkHandler(upLvl, 'upOrDown', 'up', 'down', 1, spacer3));
	downLink.addEventListener('click', makeLinkHandler(downLvl, 'upOrDown', 'down', 'up', 1, spacer3));
	darkLink.addEventListener('click', makeLinkHandler(darkLvl, 'darkOrJoy', 'dark', 'joy', 2, spacer4));
	joyLink.addEventListener('click', makeLinkHandler(joyLvl, 'darkOrJoy', 'joy', 'dark',2, spacer4));
	chaosLink.addEventListener('click', makeLinkHandler(findSongLvl, 'chaosOrGentle', 'chaos', 'gentle',3, spacer5));
	gentleLink.addEventListener('click', makeLinkHandler(findSongLvl, 'chaosOrGentle', 'gentle', 'chaos',3, spacer5));
	forestLink.addEventListener('click', makeLinkHandler(findSongLvl, 'forestOrMeadow', 'forest', 'meadow',3, spacer5));
	meadowLink.addEventListener('click', makeLinkHandler(findSongLvl, 'forestOrMeadow', 'meadow', 'forest',3, spacer5));
	outLink.addEventListener('click', makeLinkHandler(outLvl, 'outOrInner', 'out', 'inner',2, spacer4));
	innerLink.addEventListener('click', makeLinkHandler(innerLvl, 'outOrInner', 'inner', 'out',2, spacer4));
	morningLink.addEventListener('click', makeLinkHandler(findSongLvl, 'morningOrNight', 'morning', 'night',3, spacer5));
	nightLink.addEventListener('click', makeLinkHandler(findSongLvl, 'morningOrNight', 'night', 'morning',3, spacer5));
	unfoldLink.addEventListener('click', makeLinkHandler(findSongLvl, 'unfoldOrCycle', 'unfold', 'cycle',3, spacer5));
	cycleLink.addEventListener('click', makeLinkHandler(findSongLvl, 'unfoldOrCycle', 'cycle', 'unfold',3, spacer5));

	upImg.addEventListener('click', makeLinkHandler(upLvl, 'upOrDown', 'up', 'down',1, spacer3));
	downImg.addEventListener('click', makeLinkHandler(downLvl, 'upOrDown', 'down', 'up',1, spacer3));
	darkImg.addEventListener('click', makeLinkHandler(darkLvl, 'darkOrJoy', 'dark', 'joy',2, spacer4));
	joyImg.addEventListener('click', makeLinkHandler(joyLvl, 'darkOrJoy', 'joy', 'dark',2, spacer4));
	chaosImg.addEventListener('click', makeLinkHandler(findSongLvl, 'chaosOrGentle', 'chaos', 'gentle',3, spacer5));
	gentleImg.addEventListener('click', makeLinkHandler(findSongLvl, 'chaosOrGentle', 'gentle', 'chaos',3, spacer5));
	forestImg.addEventListener('click', makeLinkHandler(findSongLvl, 'forestOrMeadow', 'forest', 'meadow',3, spacer5));
	meadowImg.addEventListener('click', makeLinkHandler(findSongLvl, 'forestOrMeadow', 'meadow', 'forest',3, spacer5));
	outImg.addEventListener('click', makeLinkHandler(outLvl, 'outOrInner', 'out', 'inner',2, spacer4));
	innerImg.addEventListener('click', makeLinkHandler(innerLvl, 'outOrInner', 'inner', 'out',2, spacer4));
	morningImg.addEventListener('click', makeLinkHandler(findSongLvl, 'morningOrNight', 'morning', 'night',3, spacer5));
	nightImg.addEventListener('click', makeLinkHandler(findSongLvl, 'morningOrNight', 'night', 'morning',3, spacer5));
	unfoldImg.addEventListener('click', makeLinkHandler(findSongLvl, 'unfoldOrCycle', 'unfold', 'cycle',3, spacer5));
	cycleImg.addEventListener('click', makeLinkHandler(findSongLvl, 'unfoldOrCycle', 'cycle', 'unfold',3, spacer5));
}

window.addEventListener('load', windowOnLoad);