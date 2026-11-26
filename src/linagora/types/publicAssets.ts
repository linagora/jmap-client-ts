/**
 * Public assets (`com:linagora:params:jmap:public:assets`): uploaded images
 * served without authentication, for signatures.
 */
import type { Id, UnsignedInt } from '@linagora/jmap-client-ts';

export interface PublicAsset {
  id: Id;
  /** Server-set: `{jmap}/publicAsset/{accountId}/{id}`, no authentication. */
  publicURI: string;
  /** Server-set. */
  size: UnsignedInt;
  /** Server-set. */
  contentType: string;
  /** An uploaded image. */
  blobId: Id;
  /** Identities using the asset (the only property an update changes). */
  identityIds: Record<Id, true>;
}

export interface PublicAssetCreate {
  blobId: Id;
  identityIds?: Record<Id, true>;
}
