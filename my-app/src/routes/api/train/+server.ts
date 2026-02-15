import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/**
 * Stub: implement this in a backend that uses the Modal Python SDK to spawn
 * training jobs. See docs/MODAL_INTEGRATION.md.
 */
export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json().catch(() => ({})) as { training_type?: string };
	const _trainingType = body.training_type ?? 'rl';

	return json(
		{
			error: 'not_implemented',
			message:
				'Training API is not configured. Implement POST /api/train in a backend that calls Modal (see docs/MODAL_INTEGRATION.md).'
		},
		{ status: 501 }
	);
};
