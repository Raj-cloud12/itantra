from cryptography.hazmat.primitives.ciphers.aead import AESGCM
import os

def generate_session_key() -> bytes:
    """Generate a 256-bit (32-byte) random symmetric key.
    
    MVP simplification: This key is generated server-side and delivered to both
    clients over authenticated WebSocket. In production, this should be replaced
    with full end-to-end ECDH key exchange.
    """
    return AESGCM.generate_key(bit_length=256)

def encrypt(plaintext: bytes, key: bytes) -> tuple[bytes, bytes, bytes]:
    """Encrypt with AES-256-GCM. Returns (nonce, ciphertext, tag).
    Note: AESGCM appends the tag to ciphertext, so we split it."""
    aesgcm = AESGCM(key)
    nonce = os.urandom(12)  # 96-bit nonce
    ct_with_tag = aesgcm.encrypt(nonce, plaintext, None)
    # AESGCM appends 16-byte tag
    ciphertext = ct_with_tag[:-16]
    tag = ct_with_tag[-16:]
    return nonce, ciphertext, tag

def decrypt(nonce: bytes, ciphertext: bytes, tag: bytes, key: bytes) -> bytes:
    """Decrypt AES-256-GCM."""
    aesgcm = AESGCM(key)
    ct_with_tag = ciphertext + tag
    return aesgcm.decrypt(nonce, ct_with_tag, None)
