import { SetMetadata } from '@nestjs/common';


export const SELF_KEY = 'self';
export const AllowSelf = () => SetMetadata(SELF_KEY, true);