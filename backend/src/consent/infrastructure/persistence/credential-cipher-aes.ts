import { cipherr, decipherr } from '../../../transactions/infrastructure/persistence/cipher';
import type { CredentialCipher } from '../../domain/port/driven/credential-cipher';

// AES-256-GCM cipher at rest (RNF-014) reusing HT-010's edge cipher. The key
// comes from ENCRYPTION_KEY (hex) and never from the repository.
export class CredentialCipherAes implements CredentialCipher {
  async encrypt(plaintext: string): Promise<string> {
    return cipherr(plaintext);
  }

  async decrypt(ciphertext: string): Promise<string> {
    return decipherr(ciphertext);
  }
}