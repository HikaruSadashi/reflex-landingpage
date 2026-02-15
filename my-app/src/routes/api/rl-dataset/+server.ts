import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export type RlDatasetRecord = {
	id: string;
	incident_id: number;
	incident_title?: string;
	action_type: string;
	outcome: 'pending' | 'success' | 'failure' | 'recorded';
	recorded_at: string; // ISO
};

const store: RlDatasetRecord[] = [];
let nextId = 1;

function generateId(): string {
	return `evt-${Date.now()}-${(nextId++).toString(36)}`;
}

export const GET: RequestHandler = async () => {
	return json(store.slice().sort((a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()));
};

export const POST: RequestHandler = async ({ request }) => {
	let body: Omit<RlDatasetRecord, 'id' | 'recorded_at'> & { recorded_at?: string };
	try {
		body = await request.json();
	} catch {
		return json({ error: 'Invalid JSON' }, { status: 400 });
	}
	const id = generateId();
	const recorded_at = body.recorded_at ?? new Date().toISOString();
	const record: RlDatasetRecord = {
		id,
		incident_id: Number(body.incident_id) || 0,
		incident_title: body.incident_title,
		action_type: String(body.action_type ?? ''),
		outcome: ['pending', 'success', 'failure', 'recorded'].includes(String(body.outcome))
			? (body.outcome as RlDatasetRecord['outcome'])
			: 'recorded',
		recorded_at
	};
	store.push(record);
	return json(record, { status: 201 });
};
