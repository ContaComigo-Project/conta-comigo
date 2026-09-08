// Cipher at rest for the aggregator credential (RNF-014). Lives on the edge of
// persistence: the domain only carries the plain value during a use-case
// transaction. The concrete implementation reuses the AES-256-GCM from HT-010.
export interface CredentialCipher {
  encrypt(plaintext: string): Promise<string>;
  decrypt(ciphertext: string): Promise<string>;
}