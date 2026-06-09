/**
 * Quiz flow test helper — dev only
 * Uses Quiz.vue's real methods + QuestionGroup's real toggle/rebuild methods via $refs.
 * No duplicated logic — if you change QuestionGroup or Quiz, these tests use the real code.
 */

// --- Helpers that delegate to real component methods ---

function getRef(vm, questionNumber) {
	return vm.getQuestionGroupRef(questionNumber)
}

function findQuestionNodes(vm, questionNumber) {
	return vm.findQuestionNodes(questionNumber)
}

function findNodeByQuestion(vm, questionNumber, predicate) {
	return vm.findNodeByQuestion(questionNumber, predicate)
}

function toggleAnswer(vm, questionNumber, should) {
	const ref = getRef(vm, questionNumber)
	ref.toggleAnswer(should)
}

function toggleWrongAnswer(vm, questionNumber, should) {
	const ref = getRef(vm, questionNumber)
	ref.toggleWrongAnswer(should)
}

function toggleFollowUp(vm, questionNumber, should) {
	const ref = getRef(vm, questionNumber)
	ref.toggleFollowUpNode(should)
}

// Set a specific combination of optional nodes using the real toggle methods
// Returns array of toggle verification errors (empty = OK)
async function setCombo(vm, qNum, combo, wait) {
	const errors = []
	const ref = getRef(vm, qNum)

	// Turn off everything first
	if (ref.followUpNode) toggleFollowUp(vm, qNum, false)
	if (ref.answerNode) toggleAnswer(vm, qNum, false)
	if (ref.wrongAnswerNode) toggleWrongAnswer(vm, qNum, false)
	await wait()

	// Verify nodes are actually removed
	const refAfterStrip = getRef(vm, qNum)
	if (refAfterStrip.answerNode) errors.push(`Q${qNum}: answerNode still exists after toggle OFF`)
	if (refAfterStrip.wrongAnswerNode) errors.push(`Q${qNum}: wrongAnswerNode still exists after toggle OFF`)
	if (refAfterStrip.followUpNode) errors.push(`Q${qNum}: followUpNode still exists after toggle OFF`)

	// Turn on what's needed
	if (combo.answer) toggleAnswer(vm, qNum, true)
	if (combo.wrongAnswer) toggleWrongAnswer(vm, qNum, true)
	if (combo.followUp) toggleFollowUp(vm, qNum, true)
	await wait()

	// Verify final state matches expected combo
	const refAfterSet = getRef(vm, qNum)
	if (combo.answer && !refAfterSet.answerNode) errors.push(`Q${qNum}: answerNode missing after toggle ON`)
	if (!combo.answer && refAfterSet.answerNode) errors.push(`Q${qNum}: answerNode exists but should be OFF`)
	if (combo.wrongAnswer && !refAfterSet.wrongAnswerNode) errors.push(`Q${qNum}: wrongAnswerNode missing after toggle ON`)
	if (!combo.wrongAnswer && refAfterSet.wrongAnswerNode) errors.push(`Q${qNum}: wrongAnswerNode exists but should be OFF`)
	if (combo.followUp && !refAfterSet.followUpNode) errors.push(`Q${qNum}: followUpNode missing after toggle ON`)
	if (!combo.followUp && refAfterSet.followUpNode) errors.push(`Q${qNum}: followUpNode exists but should be OFF`)

	return errors
}

// --- Validation ---

export function validateQuizFlow(vm) {
	const errors = []
	const flow = vm.flowStore.flow
	const edges = flow.edges
	const e = (msg) => errors.push(msg)
	const outgoing = (node) => edges.filter((edge) => edge.fromNodeUuid === node.uuid)

	if (!vm.scoreResetNode) e('Missing: scoreResetNode')
	if (!vm.scoreCheckNode) e('Missing: scoreCheckNode')
	if (!vm.successNode) e('Missing: successNode')
	if (!vm.failNode) e('Missing: failNode')
	if (vm.questionNumbers.length === 0) e('No questions found')
	if (errors.length > 0) return errors

	const firstQuestionNode = findNodeByQuestion(vm, vm.questionNumbers[0], (n) => n.config.isQuestion)
	if (firstQuestionNode) {
		const resetToFirst = edges.find(
			(edge) => edge.fromNodeUuid === vm.scoreResetNode.uuid && edge.toNodeUuid === firstQuestionNode.uuid,
		)
		if (!resetToFirst) e('scoreResetNode not connected to first question')
	}

	vm.questionNumbers.forEach((qNum, qIndex) => {
		const prefix = `Q${qNum}`
		const nodes = findQuestionNodes(vm, qNum)
		const questionNode = nodes.find((n) => n.config.isQuestion)
		const pointNode = nodes.find((n) => n.config.increment)
		const answerNode = nodes.find((n) => n.config.isAnswer && n.config.isCorrect)
		const wrongAnswerNode = nodes.find((n) => n.config.isAnswer && !n.config.isCorrect)
		const followUpNode = nodes.find((n) => n.config.isQuestionFollowUp)

		if (!questionNode) { e(`${prefix}: Missing questionNode`); return }
		if (!pointNode) { e(`${prefix}: Missing pointNode`); return }

		const nextQNum = vm.questionNumbers[qIndex + 1]
		const isLast = !nextQNum
		const expectedDest = isLast ? vm.scoreCheckNode : findNodeByQuestion(vm, nextQNum, (n) => n.config.isQuestion)
		const convergence = followUpNode || expectedDest
		const destLabel = isLast ? 'scoreCheck' : `Q${nextQNum}`

		const qOutgoing = outgoing(questionNode)
		const toPointEdge = qOutgoing.find((edge) => edge.toNodeUuid === pointNode.uuid)
		if (!toPointEdge) e(`${prefix}: questionNode → pointNode missing`)
		if (!toPointEdge?.guard) e(`${prefix}: questionNode → pointNode guard missing`)

		const wrongPathEdges = qOutgoing.filter((edge) => edge.toNodeUuid !== pointNode.uuid)
		if (wrongPathEdges.length === 0) e(`${prefix}: no wrong-path edge`)
		if (wrongPathEdges.length > 1) e(`${prefix}: ${wrongPathEdges.length} wrong-path edges`)
		if (wrongPathEdges.length === 1) {
			const we = wrongPathEdges[0]
			if (!we.guard) e(`${prefix}: wrong-path guard missing`)
			const expectedTarget = wrongAnswerNode || convergence
			if (we.toNodeUuid !== expectedTarget?.uuid) e(`${prefix}: wrong-path → wrong target`)
		}
		if (qOutgoing.length > 2) e(`${prefix}: ${qOutgoing.length} outgoing from questionNode`)

		const pointOut = outgoing(pointNode)
		const expectedPointTarget = answerNode || convergence
		if (pointOut.length !== 1) e(`${prefix}: pointNode has ${pointOut.length} outgoing`)
		else if (pointOut[0].toNodeUuid !== expectedPointTarget?.uuid) e(`${prefix}: pointNode → wrong target`)

		if (answerNode) {
			const ansOut = outgoing(answerNode)
			if (ansOut.length !== 1) e(`${prefix}: answerNode has ${ansOut.length} outgoing`)
			else if (ansOut[0].toNodeUuid !== convergence?.uuid) e(`${prefix}: answerNode → wrong target`)
		}

		if (wrongAnswerNode) {
			const wrongOut = outgoing(wrongAnswerNode)
			if (wrongOut.length !== 1) e(`${prefix}: wrongAnswerNode has ${wrongOut.length} outgoing`)
			else if (wrongOut[0].toNodeUuid !== convergence?.uuid) e(`${prefix}: wrongAnswerNode → wrong target`)
		}

		if (followUpNode) {
			const fuOut = outgoing(followUpNode)
			if (fuOut.length !== 1) e(`${prefix}: followUpNode has ${fuOut.length} outgoing`)
			else if (fuOut[0].toNodeUuid !== expectedDest?.uuid) e(`${prefix}: followUpNode → wrong target (expected ${destLabel})`)
		}

		;[questionNode, pointNode, answerNode, wrongAnswerNode, followUpNode].filter(Boolean).forEach((node) => {
			const out = outgoing(node)
			const seen = new Set()
			out.forEach((edge) => {
				const key = `${edge.toNodeUuid}|${edge.guard || ''}`
				if (seen.has(key)) e(`${prefix}: duplicate edge`)
				seen.add(key)
			})
		})
	})

	if (vm.questionNumbers.length > 0) {
		const lastNodes = findQuestionNodes(vm, vm.lastQuestionNumber)
		const lastFollowUp = lastNodes.find((n) => n.config.isQuestionFollowUp)
		if (lastFollowUp) {
			if (!edges.some((ed) => ed.fromNodeUuid === lastFollowUp.uuid && ed.toNodeUuid === vm.scoreCheckNode.uuid)) {
				e('Last followUpNode not connected to scoreCheck')
			}
		} else {
			const correctEnd = lastNodes.find((n) => n.config.isAnswer && n.config.isCorrect) || lastNodes.find((n) => n.config.increment)
			const wrongEnd = lastNodes.find((n) => n.config.isAnswer && !n.config.isCorrect) || lastNodes.find((n) => n.config.isQuestion)
			if (correctEnd && !edges.some((ed) => ed.fromNodeUuid === correctEnd.uuid && ed.toNodeUuid === vm.scoreCheckNode.uuid)) {
				e('Last correct path not connected to scoreCheck')
			}
			if (wrongEnd && !edges.some((ed) => ed.fromNodeUuid === wrongEnd.uuid && ed.toNodeUuid === vm.scoreCheckNode.uuid)) {
				e('Last wrong path not connected to scoreCheck')
			}
		}
	}

	const nodeUuids = new Set(flow.nodes.map((n) => n.uuid))
	edges.forEach((edge) => {
		if (edge.fromNodeUuid && !nodeUuids.has(edge.fromNodeUuid)) e(`Dangling fromNodeUuid ${edge.fromNodeUuid}`)
		if (edge.toNodeUuid && !nodeUuids.has(edge.toNodeUuid)) e(`Dangling toNodeUuid ${edge.toNodeUuid}`)
	})

	return errors
}

// --- Test runner ---

const ALL_COMBOS = [
	{ answer: true, wrongAnswer: true, followUp: true },
	{ answer: true, wrongAnswer: true, followUp: false },
	{ answer: true, wrongAnswer: false, followUp: true },
	{ answer: true, wrongAnswer: false, followUp: false },
	{ answer: false, wrongAnswer: true, followUp: true },
	{ answer: false, wrongAnswer: true, followUp: false },
	{ answer: false, wrongAnswer: false, followUp: true },
	{ answer: false, wrongAnswer: false, followUp: false },
]

const FULL = { answer: true, wrongAnswer: true, followUp: true }
const BARE = { answer: false, wrongAnswer: false, followUp: false }

// Combo label: a=answerNode, w=wrongAnswerNode, f=followUpNode (1=exists, 0=removed)
function cl(c) {
	return `[a:${c.answer ? '1' : '0'} w:${c.wrongAnswer ? '1' : '0'} f:${c.followUp ? '1' : '0'}]`
}

export async function runAllTests(vm) {
	const testLog = []
	const log = (type, msg) => {
		testLog.push({ type, msg })
		consoleLog(`[QuizTest] ${type.toUpperCase()}: ${msg}`)
	}
	const validate = (label) => {
		const errors = validateQuizFlow(vm)
		if (errors.length === 0) {
			log('pass', label)
			return true
		}
		log('fail', `${label} — ${errors.join(' | ')}`)
		return false
	}
	const wait = () => new Promise((resolve) => vm.$nextTick(resolve))

	// setCombo wrapper: applies combo and logs toggle verification failures
	const combo = async (qNum, c) => {
		const toggleErrors = await setCombo(vm, qNum, c, wait)
		if (toggleErrors.length > 0) {
			log('fail', `Toggle verify Q${qNum} ${cl(c)} — ${toggleErrors.join(' | ')}`)
		}
		return toggleErrors
	}

	// Verify a single node exists or not after a toggle call
	const verifyNode = (qNum, nodeName, shouldExist) => {
		const ref = getRef(vm, qNum)
		const exists = !!ref[nodeName]
		if (shouldExist && !exists) {
			log('fail', `Q${qNum}: ${nodeName} missing after toggle ON`)
			return false
		}
		if (!shouldExist && exists) {
			log('fail', `Q${qNum}: ${nodeName} still exists after toggle OFF`)
			return false
		}
		return true
	}

	const ensureQuestions = async (count) => {
		while (vm.questionNumbers.length < count) {
			await vm.addQuestion()
			await wait()
		}
	}

	const getQ = (pos) => {
		const nums = vm.questionNumbers
		if (pos === 'first') return nums[0]
		if (pos === 'last') return nums[nums.length - 1]
		return nums[Math.floor(nums.length / 2)]
	}

	log('info', `Starting: ${vm.questionNumbers.length} questions [${vm.questionNumbers.join(', ')}]`)

	// =============================================
	// 1. Initial state
	// =============================================
	validate('Initial state')

	// =============================================
	// 2. Ensure 3 questions
	// =============================================
	await ensureQuestions(3)
	validate('Ensured 3 questions')
	log('info', `Questions: [${vm.questionNumbers.join(', ')}]`)

	// =============================================
	// 3. All 8 combos x 3 positions = 24 tests
	// =============================================
	for (const pos of ['last', 'first', 'middle']) {
		const q = getQ(pos)
		log('info', `--- 8 combos on ${pos.toUpperCase()} Q${q} ---`)
		for (const c of ALL_COMBOS) {
			await combo(q, c)
			validate(`Q${q}(${pos}) ${cl(c)}`)
		}
		await combo(q, FULL)
	}

	// =============================================
	// 4. Cross-question combos
	// =============================================
	log('info', '--- Cross-question combos ---')
	const [fQ, mQ, lQ] = [getQ('first'), getQ('middle'), getQ('last')]

	await combo(lQ, BARE)
	validate('Cross: last bare, mid+first full')
	await combo(mQ, BARE)
	validate('Cross: last+mid bare')
	await combo(fQ, BARE)
	validate('Cross: all bare')

	await combo(fQ, { answer: false, wrongAnswer: false, followUp: true })
	await combo(mQ, { answer: false, wrongAnswer: false, followUp: true })
	await combo(lQ, { answer: false, wrongAnswer: false, followUp: true })
	validate('Cross: all followUp-only')

	await combo(fQ, { answer: true, wrongAnswer: false, followUp: false })
	await combo(mQ, { answer: false, wrongAnswer: true, followUp: false })
	await combo(lQ, { answer: false, wrongAnswer: false, followUp: true })
	validate('Cross: each question different combo')

	await combo(fQ, FULL)
	await combo(mQ, FULL)
	await combo(lQ, FULL)
	validate('Cross: all restored')

	// =============================================
	// 5. addQuestion with ALL 8 last-question states
	// =============================================
	log('info', '--- addQuestion x 8 last-question states ---')
	for (const c of ALL_COMBOS) {
		const curLast = getQ('last')
		await combo(curLast, c)
		validate(`Before add: last Q${curLast} ${cl(c)}`)
		log('step', `Adding (prev=${cl(c)})...`)
		await vm.addQuestion()
		await wait()
		validate(`After add (prev=${cl(c)})`)
	}
	await combo(getQ('last'), FULL)
	log('info', `After add tests: [${vm.questionNumbers.join(', ')}]`)

	// =============================================
	// 6. Add then immediately delete
	// =============================================
	log('info', '--- Add + immediate delete ---')
	for (const c of [FULL, BARE, { answer: false, wrongAnswer: true, followUp: false }, { answer: true, wrongAnswer: false, followUp: true }]) {
		const curLast = getQ('last')
		await combo(curLast, c)
		log('step', `Add+delete (prev=${cl(c)})...`)
		await vm.addQuestion()
		await wait()
		validate(`After add (prev=${cl(c)})`)
		const newQ = getQ('last')
		vm.deleteQuestion(newQ)
		await wait()
		validate(`After immediate delete Q${newQ}`)
	}
	await combo(getQ('last'), FULL)

	// =============================================
	// 7. Delete from each position x combos
	// =============================================
	log('info', '--- Delete tests ---')

	// 7a. Delete MIDDLE in all 8 combos
	log('info', '--- Delete MIDDLE x 8 combos ---')
	for (const c of ALL_COMBOS) {
		await ensureQuestions(3)
		const q = getQ('middle')
		await combo(q, c)
		log('step', `Delete middle Q${q} ${cl(c)}...`)
		vm.deleteQuestion(q)
		await wait()
		validate(`After delete middle Q${q} ${cl(c)}`)
	}

	// 7b. Delete MIDDLE with prev neighbor in various states
	log('info', '--- Delete MIDDLE (prev neighbor combos) ---')
	for (const nc of [BARE, { answer: false, wrongAnswer: false, followUp: true }, { answer: true, wrongAnswer: true, followUp: false }]) {
		await ensureQuestions(3)
		const midIdx = Math.floor(vm.questionNumbers.length / 2)
		const q = vm.questionNumbers[midIdx]
		const prev = vm.questionNumbers[midIdx - 1]
		await combo(prev, nc)
		log('step', `Delete mid Q${q} (prev Q${prev}=${cl(nc)})...`)
		vm.deleteQuestion(q)
		await wait()
		validate(`After delete mid Q${q} (prev=${cl(nc)})`)
		if (vm.questionNumbers.includes(prev)) await combo(prev, FULL)
	}

	// 7c. Delete FIRST in all 8 combos
	log('info', '--- Delete FIRST x 8 combos ---')
	for (const c of ALL_COMBOS) {
		await ensureQuestions(2)
		const q = getQ('first')
		await combo(q, c)
		log('step', `Delete first Q${q} ${cl(c)}...`)
		vm.deleteQuestion(q)
		await wait()
		validate(`After delete first Q${q} ${cl(c)}`)
	}

	// 7d. Delete LAST in all 8 combos
	log('info', '--- Delete LAST x 8 combos ---')
	for (const c of ALL_COMBOS) {
		await ensureQuestions(2)
		const q = getQ('last')
		await combo(q, c)
		log('step', `Delete last Q${q} ${cl(c)}...`)
		vm.deleteQuestion(q)
		await wait()
		validate(`After delete last Q${q} ${cl(c)}`)
	}

	// 7e. Delete LAST with prev neighbor in various states
	log('info', '--- Delete LAST (prev neighbor combos) ---')
	for (const nc of [BARE, { answer: false, wrongAnswer: true, followUp: false }, { answer: true, wrongAnswer: false, followUp: true }]) {
		await ensureQuestions(2)
		const lastQ = getQ('last')
		const prevQ = vm.questionNumbers[vm.questionNumbers.length - 2]
		await combo(prevQ, nc)
		log('step', `Delete last Q${lastQ} (prev Q${prevQ}=${cl(nc)})...`)
		vm.deleteQuestion(lastQ)
		await wait()
		validate(`After delete last (prev=${cl(nc)})`)
		if (vm.questionNumbers.includes(prevQ)) await combo(prevQ, FULL)
	}

	// =============================================
	// 8. Toggle order edge cases
	// =============================================
	log('info', '--- Toggle order edge cases ---')
	await ensureQuestions(3)
	const tQ = getQ('last')
	await combo(tQ, FULL)

	// 8a. followUp off → on (original bug)
	log('step', `Q${tQ}: fu off → on`)
	toggleFollowUp(vm, tQ, false); await wait()
	verifyNode(tQ, 'followUpNode', false)
	validate(`Q${tQ}: fu removed`)
	toggleFollowUp(vm, tQ, true); await wait()
	verifyNode(tQ, 'followUpNode', true)
	validate(`Q${tQ}: fu re-added`)

	// 8b. ans off → fu off → fu on → ans on
	log('step', `Q${tQ}: ans off → fu off → fu on → ans on`)
	toggleAnswer(vm, tQ, false); await wait()
	verifyNode(tQ, 'answerNode', false)
	validate(`Q${tQ}: ans off`)
	toggleFollowUp(vm, tQ, false); await wait()
	verifyNode(tQ, 'followUpNode', false)
	validate(`Q${tQ}: ans+fu off`)
	toggleFollowUp(vm, tQ, true); await wait()
	verifyNode(tQ, 'followUpNode', true)
	verifyNode(tQ, 'answerNode', false)
	validate(`Q${tQ}: fu on, no ans`)
	toggleAnswer(vm, tQ, true); await wait()
	verifyNode(tQ, 'answerNode', true)
	validate(`Q${tQ}: ans+fu restored`)

	// 8c. wrong off → fu off → wrong on → fu on
	log('step', `Q${tQ}: wrong off → fu off → wrong on → fu on`)
	toggleWrongAnswer(vm, tQ, false); await wait()
	verifyNode(tQ, 'wrongAnswerNode', false)
	validate(`Q${tQ}: wrong off`)
	toggleFollowUp(vm, tQ, false); await wait()
	verifyNode(tQ, 'followUpNode', false)
	validate(`Q${tQ}: wrong+fu off`)
	toggleWrongAnswer(vm, tQ, true); await wait()
	verifyNode(tQ, 'wrongAnswerNode', true)
	verifyNode(tQ, 'followUpNode', false)
	validate(`Q${tQ}: wrong on, no fu`)
	toggleFollowUp(vm, tQ, true); await wait()
	verifyNode(tQ, 'followUpNode', true)
	validate(`Q${tQ}: wrong+fu restored`)

	// 8d. Strip all → add back in all 6 permutations
	const nodeNameMap = { ans: 'answerNode', wrong: 'wrongAnswerNode', fu: 'followUpNode' }
	const perms = [
		['ans', 'wrong', 'fu'],
		['ans', 'fu', 'wrong'],
		['wrong', 'ans', 'fu'],
		['wrong', 'fu', 'ans'],
		['fu', 'ans', 'wrong'],
		['fu', 'wrong', 'ans'],
	]
	const toggleOn = {
		ans: () => toggleAnswer(vm, tQ, true),
		wrong: () => toggleWrongAnswer(vm, tQ, true),
		fu: () => toggleFollowUp(vm, tQ, true),
	}
	for (const perm of perms) {
		await combo(tQ, BARE)
		verifyNode(tQ, 'answerNode', false)
		verifyNode(tQ, 'wrongAnswerNode', false)
		verifyNode(tQ, 'followUpNode', false)
		validate(`Q${tQ}: stripped before [${perm}]`)
		for (const key of perm) {
			toggleOn[key]()
			await wait()
			verifyNode(tQ, nodeNameMap[key], true)
			validate(`Q${tQ}: +${key} (order: ${perm})`)
		}
	}

	// 8e. Same toggle tests on FIRST
	const tQFirst = getQ('first')
	await combo(tQFirst, FULL)
	log('step', `Q${tQFirst}(first): fu off → on`)
	toggleFollowUp(vm, tQFirst, false); await wait()
	verifyNode(tQFirst, 'followUpNode', false)
	validate(`Q${tQFirst}(first): fu removed`)
	toggleFollowUp(vm, tQFirst, true); await wait()
	verifyNode(tQFirst, 'followUpNode', true)
	validate(`Q${tQFirst}(first): fu re-added`)

	log('step', `Q${tQFirst}(first): ans off → fu off → fu on → ans on`)
	toggleAnswer(vm, tQFirst, false); await wait()
	verifyNode(tQFirst, 'answerNode', false)
	validate(`Q${tQFirst}(first): ans off`)
	toggleFollowUp(vm, tQFirst, false); await wait()
	verifyNode(tQFirst, 'followUpNode', false)
	validate(`Q${tQFirst}(first): ans+fu off`)
	toggleFollowUp(vm, tQFirst, true); await wait()
	verifyNode(tQFirst, 'followUpNode', true)
	validate(`Q${tQFirst}(first): fu on, no ans`)
	toggleAnswer(vm, tQFirst, true); await wait()
	verifyNode(tQFirst, 'answerNode', true)
	validate(`Q${tQFirst}(first): restored`)

	// 8f. Same toggle tests on MIDDLE
	const tQMid = getQ('middle')
	await combo(tQMid, FULL)
	log('step', `Q${tQMid}(mid): fu off → on`)
	toggleFollowUp(vm, tQMid, false); await wait()
	verifyNode(tQMid, 'followUpNode', false)
	validate(`Q${tQMid}(mid): fu removed`)
	toggleFollowUp(vm, tQMid, true); await wait()
	verifyNode(tQMid, 'followUpNode', true)
	validate(`Q${tQMid}(mid): fu re-added`)

	log('step', `Q${tQMid}(mid): wrong off → fu off → wrong on → fu on`)
	toggleWrongAnswer(vm, tQMid, false); await wait()
	verifyNode(tQMid, 'wrongAnswerNode', false)
	validate(`Q${tQMid}(mid): wrong off`)
	toggleFollowUp(vm, tQMid, false); await wait()
	verifyNode(tQMid, 'followUpNode', false)
	validate(`Q${tQMid}(mid): wrong+fu off`)
	toggleWrongAnswer(vm, tQMid, true); await wait()
	verifyNode(tQMid, 'wrongAnswerNode', true)
	validate(`Q${tQMid}(mid): wrong on, no fu`)
	toggleFollowUp(vm, tQMid, true); await wait()
	verifyNode(tQMid, 'followUpNode', true)
	validate(`Q${tQMid}(mid): restored`)

	// =============================================
	// 9. Rapid add/delete cycles
	// =============================================
	log('info', '--- Rapid add/delete ---')
	const startCount = vm.questionNumbers.length

	await vm.addQuestion(); await wait()
	await vm.addQuestion(); await wait()
	await vm.addQuestion(); await wait()
	validate(`After rapid 3 adds (${vm.questionNumbers.length}q)`)

	vm.deleteQuestion(getQ('last')); await wait()
	validate('Rapid: delete last')
	vm.deleteQuestion(getQ('first')); await wait()
	validate('Rapid: delete first')
	if (vm.questionNumbers.length >= 3) {
		vm.deleteQuestion(getQ('middle')); await wait()
		validate('Rapid: delete middle')
	}

	while (vm.questionNumbers.length < startCount) {
		await vm.addQuestion(); await wait()
	}
	validate('After restoring count')

	// =============================================
	// Summary
	// =============================================
	log('info', `Ended: ${vm.questionNumbers.length}q [${vm.questionNumbers.join(', ')}]`)
	const passCount = testLog.filter((l) => l.type === 'pass').length
	const failCount = testLog.filter((l) => l.type === 'fail').length
	log('info', `DONE: ${passCount} passed, ${failCount} failed / ${passCount + failCount} total`)

	return { testLog, validationErrors: validateQuizFlow(vm) }
}
