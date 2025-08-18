'use client';

import { api } from '~/trpc/react';

export function LatestPost() {
  const secretMessage = api.post.getSecretMessage.useQuery();

  return (
    <div className="w-full max-w-xs">
      <p className="text-white">{secretMessage.data ? secretMessage.data : 'Loading...'}</p>
    </div>
  );
}
