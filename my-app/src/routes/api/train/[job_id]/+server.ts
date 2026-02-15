import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/**
 * Stub: implement this in your backend to poll Modal FunctionCall status.
 * See docs/MODAL_INTEGRATION.md.
 */
export const GET: RequestHandler = async ({ params }) => {
	const _jobId = params.job_id;

	return json(
		{
			error: 'not_implemented',
			message: 'Job status API is not configured. Implement GET /api/train/:job_id in your backend.'
		},
		{ status: 501 }
	);
};
