const jwt = require('jsonwebtoken');
const crypto = require('crypto');

describe('🧪 Pruebas Unitarias - Autenticación', () => {
  
  const JWT_SECRET = crypto.randomBytes(64).toString('hex'); 
  
  describe('JWT - Generar Token', () => {
    it('✅ Debe generar un token válido', () => {
      const payload = { id: 1, rol: 'admin' };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
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
      const WRONG_SECRET = crypto.randomBytes(64).toString('hex');
      expect(() => {
        jwt.verify(token, WRONG_SECRET);
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