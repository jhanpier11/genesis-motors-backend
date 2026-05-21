const jwt = require('jsonwebtoken');

describe('🧪 Pruebas Unitarias - Autenticación', () => {
  
  const JWT_SECRET = 'genesis_motors_secret_key';

  describe('JWT - Generar Token', () => {
    it('✅ Debe generar un token válido', () => {
      const payload = { id: 1, rol: 'admin' };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // Header.Payload.Signature
    });

    it('✅ El token debe contener los datos del payload', () => {
      const payload = { id: 1, rol: 'admin' };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
      
      const decoded = jwt.verify(token, JWT_SECRET);
      expect(decoded.id).toBe(1);
      expect(decoded.rol).toBe('admin');
    });

    it('❌ Debe fallar con token inválido', () => {
      const invalidToken = 'token.invalido.123';
      
      expect(() => {
        jwt.verify(invalidToken, JWT_SECRET);
      }).toThrow();
    });

    it('❌ Debe fallar con secret incorrecto', () => {
      const token = jwt.sign({ id: 1 }, JWT_SECRET);
      
      expect(() => {
        jwt.verify(token, 'wrong_secret');
      }).toThrow();
    });
  });

  describe('Validación de Roles', () => {
    const validRoles = ['admin', 'mecanico', 'recepcionista', 'cliente'];
    const invalidRoles = ['superadmin', 'visitante', 'invitado'];

    it('✅ Debe aceptar roles válidos', () => {
      validRoles.forEach(rol => {
        expect(validRoles).toContain(rol);
      });
    });

    it('❌ No debe aceptar roles inválidos', () => {
      invalidRoles.forEach(rol => {
        expect(validRoles).not.toContain(rol);
      });
    });
  });
});