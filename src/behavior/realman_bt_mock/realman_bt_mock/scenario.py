def normalize_mode_request(mode, owner_id):
    if mode not in {'none', 'web', 'policy', 'teleop'}:
        raise ValueError(f'unknown control mode: {mode}')
    if mode != 'none' and not owner_id:
        raise ValueError('owner_id is required')
    return {'mode': mode, 'owner_id': owner_id}


def recorder_entry(mode, owner_id, epoch, action, sequence, result, failure_code):
    return {'mode': mode, 'owner_id': owner_id, 'epoch': epoch, 'action': action,
            'sequence': sequence, 'result': result, 'failure_code': failure_code}
