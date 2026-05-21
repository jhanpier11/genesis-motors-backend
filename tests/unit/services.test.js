describe('🧪 Pruebas Unitarias - Servicios y Utilidades', () => {
  
  describe('Calcular costo total', () => {
    const calcularTotal = (servicios) => {
      if (!servicios || !Array.isArray(servicios)) return 0;
      return servicios.reduce((total, s) => total + (parseFloat(s.precio) || 0), 0);
    };

    it('✅ Suma correcta de servicios', () => {
      const servicios = [
        { nombre: 'Aceite', precio: 450 },
        { nombre: 'Frenos', precio: 800 }
      ];
      expect(calcularTotal(servicios)).toBe(1250);
    });

    it('✅ Retorna 0 para array vacío', () => {
      expect(calcularTotal([])).toBe(0);
    });

    it('✅ Retorna 0 para null', () => {
      expect(calcularTotal(null)).toBe(0);
    });

    it('✅ Retorna 0 para undefined', () => {
      expect(calcularTotal(undefined)).toBe(0);
    });

    it('✅ Ignora items sin precio', () => {
      const servicios = [
        { nombre: 'Aceite', precio: 100 },
        { nombre: 'Revisión' }
      ];
      expect(calcularTotal(servicios)).toBe(100);
    });
  });

  describe('Formatear fecha', () => {
    const formatDate = (date) => {
      if (!date) return '';
      const d = new Date(date);
      if (isNaN(d.getTime())) return '';
      return d.toLocaleDateString('es-PE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    };

    it('✅ Formatea fecha correctamente', () => {
      const result = formatDate('2024-01-15');
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result).toContain('2024');
    });

    it('✅ Retorna vacío para null', () => {
      expect(formatDate(null)).toBe('');
    });

    it('✅ Retorna vacío para undefined', () => {
      expect(formatDate(undefined)).toBe('');
    });

    it('✅ Retorna vacío para fecha inválida', () => {
      expect(formatDate('no es fecha')).toBe('');
    });
  });

  describe('Generar código de orden', () => {
    const generarCodigo = () => {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const random = Math.floor(1000 + Math.random() * 9000);
      return `OT-${year}${month}${day}-${random}`;
    };

    it('✅ Formato correcto OT-YYYYMMDD-XXXX', () => {
      const codigo = generarCodigo();
      expect(codigo).toMatch(/^OT-\d{8}-\d{4}$/);
    });

    it('✅ Empieza con OT-', () => {
      const codigo = generarCodigo();
      expect(codigo.startsWith('OT-')).toBe(true);
    });

    it('✅ Tiene longitud correcta (16 o 17 caracteres)', () => {
    const codigo = generarCodigo();
    // OT-20240514-1234 = 17 caracteres (mes y día con 2 dígitos)
    // OT-2024514-1234 = 16 caracteres (mes con 1 dígito)
    expect(codigo.length).toBeGreaterThanOrEqual(16);
    expect(codigo.length).toBeLessThanOrEqual(17);
    });

    it('✅ Genera valores tipo string', () => {
      const codigo = generarCodigo();
      expect(typeof codigo).toBe('string');
    });
  });

  describe('Validar teléfono', () => {
    const validarTelefono = (telefono) => {
      if (!telefono) return false;
      const regex = /^\d{7,15}$/;
      return regex.test(telefono.replace(/[\s-]/g, ''));
    };

    it('✅ Acepta teléfonos válidos', () => {
      expect(validarTelefono('999888777')).toBe(true);
      expect(validarTelefono('1234567')).toBe(true);
      expect(validarTelefono('999 888 777')).toBe(true);
      expect(validarTelefono('999-888-777')).toBe(true);
    });

    it('❌ Rechaza teléfonos inválidos', () => {
      expect(validarTelefono('123')).toBe(false);
      expect(validarTelefono('')).toBe(false);
      expect(validarTelefono(null)).toBe(false);
      expect(validarTelefono('abcdefg')).toBe(false);
    });
  });

  describe('Roles de usuario', () => {
    const ROLES = {
      ADMIN: 'admin',
      MECANICO: 'mecanico',
      RECEPCIONISTA: 'recepcionista',
      CLIENTE: 'cliente'
    };

    const ROLES_PERMITIDOS = Object.values(ROLES);

    it('✅ Tiene 4 roles definidos', () => {
      expect(ROLES_PERMITIDOS).toHaveLength(4);
    });

    it('✅ Contiene rol admin', () => {
      expect(ROLES_PERMITIDOS).toContain('admin');
    });

    it('✅ Contiene rol cliente', () => {
      expect(ROLES_PERMITIDOS).toContain('cliente');
    });

    it('✅ Contiene rol mecanico', () => {
      expect(ROLES_PERMITIDOS).toContain('mecanico');
    });

    it('✅ Contiene rol recepcionista', () => {
      expect(ROLES_PERMITIDOS).toContain('recepcionista');
    });
  });
});