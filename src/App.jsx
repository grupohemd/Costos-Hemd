import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, collection, getDocs } from 'firebase/firestore';

// ============================================
// CONFIGURACIÓN DE FIREBASE
// ============================================
const firebaseConfig = {
  apiKey: "AIzaSyAZO4_ckQ3-k019Yykvkt0f8T6hDlGyfKg",
  authDomain: "costos-hemd.firebaseapp.com",
  projectId: "costos-hemd",
  storageBucket: "costos-hemd.firebasestorage.app",
  messagingSenderId: "864293531130",
  appId: "1:864293531130:web:353f7010a490f44103c843",
  measurementId: "G-66M758B14P"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ============================================
// CREDENCIALES DE USUARIO
// ============================================
const mockDB = {
  users: [
    { email: 'grupohemd@gmail.com', password: 'Camisa14', name: 'Grupo HEMD' }
  ],
  brands: [
    { id: '1', name: 'Soul Chkn', color: '#F97316' },
    { id: '2', name: 'Green Memo', color: '#22C55E' }
  ]
};

// Datos iniciales de ingredientes del PDF - TODOS los ingredientes con % de merma
const initialIngredients = [
  // Página 1 - Harinas y derivados (0% merma)
  { id: '1', medida: 'gr', ingrediente: 'Harina pan', pesoCompra: 998, precio: 83.01, grupo: 'Harinas y derivados', marca: 'Pan', proveedor: 'Sinergia', merma: 0, fechaActualizacion: '14/07/2025' },
  { id: '2', medida: 'gr', ingrediente: 'Maicena', pesoCompra: 2300, precio: 339.95, grupo: 'Harinas y derivados', marca: 'Maicena', proveedor: 'Pricesmart', merma: 0, fechaActualizacion: '14/07/2025' },
  { id: '3', medida: 'gr', ingrediente: 'Harina', pesoCompra: null, precio: null, grupo: 'Harinas y derivados', marca: 'La rosa', proveedor: '', merma: 0, fechaActualizacion: '14/07/2025' },
  // Polvos y sazonadores (0% merma)
  { id: '4', medida: 'gr', ingrediente: 'Paprika', pesoCompra: 453, precio: 164.95, grupo: 'Polvos y sazonadores', marca: 'Member selection', proveedor: 'Pricesmart', merma: 0, fechaActualizacion: '14/07/2025' },
  { id: '5', medida: 'gr', ingrediente: 'Ajo en polvo', pesoCompra: 680, precio: 209.95, grupo: 'Polvos y sazonadores', marca: 'Badia', proveedor: 'Pricesmart', merma: 0, fechaActualizacion: '14/07/2025' },
  { id: '6', medida: 'gr', ingrediente: 'Pimienta', pesoCompra: 453, precio: 179.95, grupo: 'Polvos y sazonadores', marca: 'Member selection', proveedor: 'Pricesmart', merma: 0, fechaActualizacion: '14/07/2025' },
  { id: '7', medida: 'gr', ingrediente: 'Sal', pesoCompra: 2948, precio: 139.95, grupo: 'Polvos y sazonadores', marca: 'Goya', proveedor: 'Pricesmart', merma: 0, fechaActualizacion: '14/07/2025' },
  // Salsas y derivados (0% merma)
  { id: '8', medida: 'gr', ingrediente: 'Agua potable', pesoCompra: null, precio: 50.00, grupo: 'Salsas y derivados', marca: 'Agua azul', proveedor: 'Agua azul', merma: 0, fechaActualizacion: '14/07/2025' },
  // Proteinas
  { id: '9', medida: 'und', ingrediente: 'Huevo', pesoCompra: 60, precio: 214.95, grupo: 'Proteinas', marca: 'Rica yema', proveedor: 'Pricesmart', merma: 12, fechaActualizacion: '14/07/2025' },
  // Frutas y verduras
  { id: '10', medida: 'gr', ingrediente: 'Chile morron', pesoCompra: 198, precio: 14.00, grupo: 'Frutas y verduras', marca: 'Ceip', proveedor: 'Mayoreo', merma: 22, fechaActualizacion: '14/07/2025' },
  { id: '11', medida: 'gr', ingrediente: 'Aceite de oliva normal', pesoCompra: null, precio: null, grupo: 'Salsas y derivados', marca: '', proveedor: 'Belca', merma: 0, fechaActualizacion: '14/07/2025' },
  { id: '12', medida: 'gr', ingrediente: 'Miel', pesoCompra: null, precio: null, grupo: 'Salsas y derivados', marca: 'Miel Lilian', proveedor: '', merma: 0, fechaActualizacion: '14/07/2025' },
  { id: '13', medida: 'gr', ingrediente: 'Mayonesa', pesoCompra: 21044, precio: 2599, grupo: 'Salsas y derivados', marca: '', proveedor: '', merma: 0, fechaActualizacion: '14/07/2025' },
  { id: '14', medida: 'gr', ingrediente: 'Peperoncini', pesoCompra: null, precio: null, grupo: 'Salsas y derivados', marca: '', proveedor: 'Belca', merma: 0, fechaActualizacion: '14/07/2025' },
  { id: '15', medida: 'gr', ingrediente: 'Anchoas', pesoCompra: null, precio: null, grupo: 'Proteinas', marca: '', proveedor: 'Belca', merma: 0, fechaActualizacion: '14/07/2025' },
  { id: '16', medida: 'gr', ingrediente: 'Aceitunas', pesoCompra: null, precio: null, grupo: 'Frutas y verduras', marca: '', proveedor: 'Belca', merma: 15, fechaActualizacion: '14/07/2025' },
  { id: '17', medida: 'gr', ingrediente: 'Ajo', pesoCompra: 185, precio: 30.00, grupo: 'Frutas y verduras', marca: 'Ceip', proveedor: 'Mayoreo', merma: 12, fechaActualizacion: '14/07/2025' },
  { id: '18', medida: 'gr', ingrediente: 'Perejil', pesoCompra: 136.5, precio: 14.00, grupo: 'Frutas y verduras', marca: 'Ceip', proveedor: 'Mayoreo', merma: 40, fechaActualizacion: '14/07/2025' },
  { id: '19', medida: 'gr', ingrediente: 'Jack Daniels', pesoCompra: 750, precio: 834.95, grupo: 'Alcohol', marca: 'Jack Daniels', proveedor: 'Pricesmart', merma: 0, fechaActualizacion: '14/07/2025' },
  { id: '20', medida: 'gr', ingrediente: 'Ketchup', pesoCompra: 1810, precio: 124.95, grupo: 'Salsas y derivados', marca: 'Member selection', proveedor: 'Pricesmart', merma: 0, fechaActualizacion: '14/07/2025' },
  { id: '21', medida: 'gr', ingrediente: 'Mostaza cafe', pesoCompra: null, precio: null, grupo: 'Salsas y derivados', marca: '', proveedor: 'La colonia', merma: 0, fechaActualizacion: '14/07/2025' },
  { id: '22', medida: 'gr', ingrediente: 'Pepinillos', pesoCompra: 453, precio: 174.95, grupo: 'Frutas y verduras', marca: '', proveedor: 'Pricesmart', merma: 0, fechaActualizacion: '14/07/2025' },
  { id: '23', medida: 'gr', ingrediente: 'Zanahoria', pesoCompra: 453, precio: 14.00, grupo: 'Frutas y verduras', marca: 'Ceip', proveedor: 'Mayoreo', merma: 8, fechaActualizacion: '14/07/2025' },
  { id: '24', medida: 'gr', ingrediente: 'Cilantro', pesoCompra: 136.5, precio: 15.00, grupo: 'Frutas y verduras', marca: 'Ceip', proveedor: 'Mayoreo', merma: 40, fechaActualizacion: '14/07/2025' },
  { id: '25', medida: 'gr', ingrediente: 'Azucar', pesoCompra: 1800, precio: 479.95, grupo: 'Polvos y sazonadores', marca: 'Matilde', proveedor: 'Pricesmart', merma: 0, fechaActualizacion: '14/07/2025' },
  { id: '26', medida: 'gr', ingrediente: 'Vinagre', pesoCompra: 3700, precio: 129.95, grupo: 'Salsas y derivados', marca: 'La buena cocina', proveedor: 'Pricesmart', merma: 0, fechaActualizacion: '14/07/2025' },
  { id: '27', medida: 'gr', ingrediente: 'Piña', pesoCompra: 453, precio: null, grupo: 'Frutas y verduras', marca: 'Ceip', proveedor: 'Mayoreo', merma: 38, fechaActualizacion: '14/07/2025' },
  { id: '28', medida: 'gr', ingrediente: 'Muslo de pollo', pesoCompra: 454, precio: 39.00, grupo: 'Proteinas', marca: 'El cortijo', proveedor: 'El cortijo', merma: 30, fechaActualizacion: '14/07/2025' },
  { id: '29', medida: 'gr', ingrediente: 'Pechuga de pollo', pesoCompra: 454, precio: null, grupo: 'Proteinas', marca: 'El cortijo', proveedor: 'El cortijo', merma: 22, fechaActualizacion: '14/07/2025' },
  { id: '30', medida: 'gr', ingrediente: 'Lechuga cabeza', pesoCompra: 1044.5, precio: 25.00, grupo: 'Frutas y verduras', marca: 'Ceip', proveedor: 'Mayoreo', merma: 25, fechaActualizacion: '14/07/2025' },
  // Página 2
  { id: '31', medida: 'gr', ingrediente: 'Papa', pesoCompra: 453, precio: 17.00, grupo: 'Frutas y verduras', marca: 'Ceip', proveedor: 'Mayoreo', merma: 18, fechaActualizacion: '14/07/2025' },
  { id: '32', medida: 'gr', ingrediente: 'Maiz', pesoCompra: 2000, precio: 219.95, grupo: 'Frutas y verduras', marca: 'Del monte', proveedor: 'Pricesmart', merma: 0, fechaActualizacion: '14/07/2025' },
  { id: '33', medida: 'gr', ingrediente: 'Leche entera', pesoCompra: 11352, precio: 439.95, grupo: 'Lacteos y derivados', marca: 'Sula', proveedor: 'Pricesmart', merma: 0, fechaActualizacion: '14/07/2025' },
  { id: '34', medida: 'gr', ingrediente: 'Cebolla en polvo', pesoCompra: null, precio: null, grupo: 'Polvos y sazonadores', marca: '', proveedor: 'Belca', merma: 0, fechaActualizacion: '14/07/2025' },
  { id: '35', medida: 'gr', ingrediente: 'Barbacoa', pesoCompra: 2300, precio: 162.95, grupo: 'Salsas y derivados', marca: 'Kraft', proveedor: 'Pricesmart', merma: 0, fechaActualizacion: '14/07/2025' },
  { id: '36', medida: 'gr', ingrediente: 'Tomate', pesoCompra: 453, precio: 17.00, grupo: 'Frutas y verduras', marca: 'Ceip', proveedor: 'Mayoreo', merma: 5, fechaActualizacion: '14/07/2025' },
  { id: '37', medida: 'gr', ingrediente: 'Repollo blanco', pesoCompra: 2246, precio: 45.00, grupo: 'Frutas y verduras', marca: 'Ceip', proveedor: 'Mayoreo', merma: 25, fechaActualizacion: '14/07/2025' },
  { id: '38', medida: 'gr', ingrediente: 'Jalapeño', pesoCompra: 453, precio: 18.00, grupo: 'Frutas y verduras', marca: 'Ceip', proveedor: 'Mayoreo', merma: 22, fechaActualizacion: '14/07/2025' },
  { id: '39', medida: 'gr', ingrediente: 'Limon', pesoCompra: 91, precio: 2.00, grupo: 'Frutas y verduras', marca: 'Ceip', proveedor: 'Mayoreo', merma: 40, fechaActualizacion: '14/07/2025' },
  { id: '40', medida: 'gr', ingrediente: 'Comino', pesoCompra: 90, precio: 29.90, grupo: 'Polvos y sazonadores', marca: '', proveedor: '', merma: 0, fechaActualizacion: '14/07/2025' },
  { id: '41', medida: 'gr', ingrediente: 'Chips de platano', pesoCompra: 700, precio: 162.95, grupo: 'Frutas y verduras', marca: 'Rica sula', proveedor: 'Pricesmart', merma: 0, fechaActualizacion: '14/07/2025' },
  { id: '42', medida: 'gr', ingrediente: 'Ajo puerro / Cebollín', pesoCompra: 110, precio: 15.00, grupo: 'Frutas y verduras', marca: 'Ceip', proveedor: 'Mayoreo', merma: 48, fechaActualizacion: '14/07/2025' },
  { id: '43', medida: 'gr', ingrediente: 'Apio', pesoCompra: 127, precio: 12.00, grupo: 'Frutas y verduras', marca: 'Ceip', proveedor: 'Mayoreo', merma: 25, fechaActualizacion: '14/07/2025' },
  { id: '44', medida: 'gr', ingrediente: 'Tomillo', pesoCompra: null, precio: null, grupo: 'Polvos y sazonadores', marca: '', proveedor: '', merma: 0, fechaActualizacion: '14/07/2025' },
  { id: '45', medida: 'gr', ingrediente: 'Pepino', pesoCompra: 377.5, precio: 8.00, grupo: 'Frutas y verduras', marca: 'Ceip', proveedor: 'Mayoreo', merma: 16, fechaActualizacion: '14/07/2025' },
  { id: '46', medida: 'gr', ingrediente: 'Soja', pesoCompra: null, precio: null, grupo: 'Salsas y derivados', marca: '', proveedor: '', merma: 0, fechaActualizacion: '14/07/2025' },
  { id: '47', medida: 'gr', ingrediente: 'Rabano', pesoCompra: 453, precio: 18.00, grupo: 'Frutas y verduras', marca: 'Ceip', proveedor: 'Mayoreo', merma: 10, fechaActualizacion: '14/07/2025' },
  { id: '48', medida: 'gr', ingrediente: 'Cebolla blanca', pesoCompra: 453, precio: 20.00, grupo: 'Frutas y verduras', marca: 'Ceip', proveedor: 'Mayoreo', merma: 12, fechaActualizacion: '14/07/2025' },
  { id: '49', medida: 'gr', ingrediente: 'Cebolla roja', pesoCompra: 453, precio: 20.00, grupo: 'Frutas y verduras', marca: 'Ceip', proveedor: 'Mayoreo', merma: 12, fechaActualizacion: '14/07/2025' },
  { id: '50', medida: 'gr', ingrediente: 'Papas fritas congeladas', pesoCompra: null, precio: null, grupo: 'Frutas y verduras', marca: '', proveedor: 'Didac', merma: 0, fechaActualizacion: '14/07/2025' },
  { id: '51', medida: 'gr', ingrediente: 'Chetos flaming hot', pesoCompra: null, precio: null, grupo: 'Snacks', marca: '', proveedor: 'La colonia', merma: 0, fechaActualizacion: '14/07/2025' },
  { id: '52', medida: 'gr', ingrediente: 'Elotes tostados picantes', pesoCompra: null, precio: null, grupo: 'Snacks', marca: '', proveedor: 'La colonia', merma: 0, fechaActualizacion: '14/07/2025' },
  { id: '53', medida: 'gr', ingrediente: 'Mantequilla rala', pesoCompra: null, precio: null, grupo: 'Lacteos y derivados', marca: '', proveedor: 'La colonia', merma: 0, fechaActualizacion: '14/07/2025' },
  { id: '54', medida: 'gr', ingrediente: 'Salsa Valentina', pesoCompra: null, precio: null, grupo: 'Salsas y derivados', marca: '', proveedor: 'El canton', merma: 0, fechaActualizacion: '14/07/2025' },
  { id: '55', medida: 'gr', ingrediente: 'Chile california', pesoCompra: 453, precio: null, grupo: 'Frutas y verduras', marca: 'Ceip', proveedor: 'Mayoreo', merma: 22, fechaActualizacion: '14/07/2025' },
  { id: '56', medida: 'gr', ingrediente: 'Galleta maria', pesoCompra: null, precio: null, grupo: 'Harinas y derivados', marca: '', proveedor: 'La colonia', merma: 0, fechaActualizacion: '14/07/2025' },
  { id: '57', medida: 'gr', ingrediente: 'Mantequilla amarilla', pesoCompra: 454, precio: 279.95, grupo: 'Lacteos y derivados', marca: 'Leyde', proveedor: 'Pricesmart', merma: 0, fechaActualizacion: '14/07/2025' },
  { id: '58', medida: 'gr', ingrediente: 'Rapadura', pesoCompra: 809, precio: 55.00, grupo: 'Polvos y sazonadores', marca: 'Ceip', proveedor: 'Mayoreo', merma: 0, fechaActualizacion: '14/07/2025' },
  { id: '59', medida: 'gr', ingrediente: 'Dulce de leche', pesoCompra: null, precio: null, grupo: 'Salsas y derivados', marca: '', proveedor: 'La colonia', merma: 0, fechaActualizacion: '14/07/2025' },
  { id: '60', medida: 'gr', ingrediente: 'Crema dulce', pesoCompra: 2250, precio: 367.95, grupo: 'Lacteos y derivados', marca: 'Dos pinos', proveedor: 'Pricesmart', merma: 0, fechaActualizacion: '14/07/2025' },
  { id: '61', medida: 'gr', ingrediente: 'Banano', pesoCompra: 149, precio: 4.00, grupo: 'Frutas y verduras', marca: 'Ceip', proveedor: 'Mayoreo', merma: 35, fechaActualizacion: '14/07/2025' },
  // Página 3
  { id: '62', medida: 'gr', ingrediente: 'Crema batida', pesoCompra: null, precio: null, grupo: 'Lacteos y derivados', marca: '', proveedor: 'La colonia', merma: 0, fechaActualizacion: '14/07/2025' },
  { id: '63', medida: 'und', ingrediente: 'Pan brioche', pesoCompra: 8, precio: null, grupo: 'Harinas y derivados', marca: '', proveedor: 'Pan y mas', merma: 0, fechaActualizacion: '14/07/2025' },
  { id: '64', medida: 'gr', ingrediente: 'Togarashi', pesoCompra: null, precio: null, grupo: 'Polvos y sazonadores', marca: '', proveedor: 'Belca', merma: 0, fechaActualizacion: '14/07/2025' },
  { id: '65', medida: 'gr', ingrediente: 'Jengibre', pesoCompra: 453, precio: 40.00, grupo: 'Frutas y verduras', marca: 'Ceip', proveedor: 'Mayoreo', merma: 10, fechaActualizacion: '14/07/2025' },
  { id: '66', medida: 'gr', ingrediente: 'Camote', pesoCompra: 453, precio: 17.00, grupo: 'Frutas y verduras', marca: 'Ceip', proveedor: 'Mayoreo', merma: 20, fechaActualizacion: '14/07/2025' },
  { id: '67', medida: 'gr', ingrediente: 'Aguacate', pesoCompra: 453, precio: 25.00, grupo: 'Frutas y verduras', marca: 'Ceip', proveedor: 'Mayoreo', merma: 30, fechaActualizacion: '14/07/2025' },
  { id: '68', medida: 'gr', ingrediente: 'Cancha', pesoCompra: null, precio: null, grupo: 'Snacks', marca: '', proveedor: 'Los andes sps', merma: 0, fechaActualizacion: '14/07/2025' },
  { id: '69', medida: 'gr', ingrediente: 'Aceite de sesamo', pesoCompra: null, precio: null, grupo: 'Salsas y derivados', marca: '', proveedor: '', merma: 0, fechaActualizacion: '14/07/2025' },
  { id: '70', medida: 'gr', ingrediente: 'Concentrado de mango', pesoCompra: null, precio: null, grupo: 'Salsas y derivados', marca: '', proveedor: 'La colonia', merma: 0, fechaActualizacion: '14/07/2025' },
  { id: '71', medida: 'gr', ingrediente: 'Lechuga romana', pesoCompra: 453, precio: 22.00, grupo: 'Frutas y verduras', marca: 'Ceip', proveedor: 'Mayoreo', merma: 33, fechaActualizacion: '14/07/2025' },
  { id: '72', medida: 'gr', ingrediente: 'Salsa maggi negra', pesoCompra: null, precio: null, grupo: 'Salsas y derivados', marca: '', proveedor: '', merma: 0, fechaActualizacion: '14/07/2025' },
  { id: '73', medida: 'und', ingrediente: 'Tortillas', pesoCompra: null, precio: null, grupo: 'Harinas y derivados', marca: '', proveedor: '', merma: 0, fechaActualizacion: '14/07/2025' },
  { id: '74', medida: 'gr', ingrediente: 'Mantequilla de maní', pesoCompra: 1130, precio: 154.95, grupo: 'Salsas y derivados', marca: 'Member selection', proveedor: 'Pricesmart', merma: 0, fechaActualizacion: '14/07/2025' },
  { id: '75', medida: 'gr', ingrediente: 'Vinagre de sushi', pesoCompra: null, precio: null, grupo: 'Salsas y derivados', marca: '', proveedor: 'El canton', merma: 0, fechaActualizacion: '14/07/2025' },
  { id: '76', medida: 'gr', ingrediente: 'Hoisin', pesoCompra: null, precio: null, grupo: 'Salsas y derivados', marca: '', proveedor: '', merma: 0, fechaActualizacion: '14/07/2025' },
  { id: '77', medida: 'gr', ingrediente: 'Semillas de sesamo', pesoCompra: null, precio: null, grupo: 'Polvos y sazonadores', marca: '', proveedor: '', merma: 0, fechaActualizacion: '14/07/2025' },
  { id: '78', medida: 'gr', ingrediente: 'Glutamato', pesoCompra: null, precio: null, grupo: 'Polvos y sazonadores', marca: '', proveedor: '', merma: 0, fechaActualizacion: '14/07/2025' },
  { id: '79', medida: 'gr', ingrediente: 'Fideos', pesoCompra: null, precio: null, grupo: 'Harinas y derivados', marca: '', proveedor: 'La colonia', merma: 0, fechaActualizacion: '14/07/2025' },
  { id: '80', medida: 'gr', ingrediente: 'Edamame', pesoCompra: null, precio: null, grupo: 'Frutas y verduras', marca: '', proveedor: 'Didac', merma: 50, fechaActualizacion: '14/07/2025' },
  { id: '81', medida: 'gr', ingrediente: 'Repollo morado', pesoCompra: 1216, precio: 65.00, grupo: 'Frutas y verduras', marca: 'Ceip', proveedor: 'Mayoreo', merma: 35, fechaActualizacion: '14/07/2025' },
  { id: '82', medida: 'gr', ingrediente: 'Panko', pesoCompra: null, precio: null, grupo: 'Harinas y derivados', marca: '', proveedor: '', merma: 0, fechaActualizacion: '14/07/2025' },
  { id: '83', medida: 'gr', ingrediente: 'Pan rallado', pesoCompra: null, precio: null, grupo: 'Harinas y derivados', marca: '', proveedor: '', merma: 0, fechaActualizacion: '14/07/2025' },
  { id: '84', medida: 'gr', ingrediente: 'Champiñones', pesoCompra: 340, precio: 144.95, grupo: 'Frutas y verduras', marca: '', proveedor: 'Pricesmart', merma: 10, fechaActualizacion: '14/07/2025' },
  { id: '85', medida: 'gr', ingrediente: 'Shitake', pesoCompra: null, precio: null, grupo: 'Frutas y verduras', marca: '', proveedor: 'Belca', merma: 15, fechaActualizacion: '14/07/2025' },
  { id: '86', medida: 'gr', ingrediente: 'Polvo de hongos', pesoCompra: null, precio: null, grupo: 'Polvos y sazonadores', marca: '', proveedor: 'La colonia', merma: 0, fechaActualizacion: '14/07/2025' },
  { id: '87', medida: 'gr', ingrediente: 'Aceite mazola', pesoCompra: 5000, precio: 527.95, grupo: 'Salsas y derivados', marca: 'Mazola', proveedor: 'Pricesmart', merma: 0, fechaActualizacion: '14/07/2025' },
  { id: '88', medida: 'gr', ingrediente: 'Naranja agria', pesoCompra: 453, precio: null, grupo: 'Frutas y verduras', marca: 'Ceip', proveedor: 'Mayoreo', merma: 35, fechaActualizacion: '14/07/2025' },
  { id: '89', medida: 'gr', ingrediente: 'Garbanzos', pesoCompra: 1756, precio: 172.95, grupo: 'Proteinas', marca: 'Goya', proveedor: 'Pricesmart', merma: 0, fechaActualizacion: '14/07/2025' },
  { id: '90', medida: 'gr', ingrediente: 'Hielo', pesoCompra: null, precio: null, grupo: 'Otros', marca: '', proveedor: '', merma: 0, fechaActualizacion: '14/07/2025' },
  { id: '91', medida: 'gr', ingrediente: 'Tajine', pesoCompra: null, precio: null, grupo: 'Polvos y sazonadores', marca: '', proveedor: '', merma: 0, fechaActualizacion: '14/07/2025' },
  { id: '92', medida: 'und', ingrediente: 'Pan pita', pesoCompra: null, precio: null, grupo: 'Harinas y derivados', marca: '', proveedor: '', merma: 0, fechaActualizacion: '14/07/2025' },
  // Página 4
  { id: '93', medida: 'gr', ingrediente: 'Filete de res', pesoCompra: 454, precio: 225.00, grupo: 'Proteinas', marca: '', proveedor: 'Delicatessen', merma: 27, fechaActualizacion: '14/07/2025' },
  { id: '94', medida: 'gr', ingrediente: 'Almendras laminadas', pesoCompra: 907, precio: 309.95, grupo: 'Frutos secos', marca: 'Member selection', proveedor: 'Pricesmart', merma: 0, fechaActualizacion: '14/07/2025' },
  { id: '95', medida: 'gr', ingrediente: 'Berenjena', pesoCompra: 200, precio: 10.00, grupo: 'Frutas y verduras', marca: 'Ceip', proveedor: 'Mayoreo', merma: 19, fechaActualizacion: '14/07/2025' },
  { id: '96', medida: 'gr', ingrediente: 'Concentrado de tomate', pesoCompra: null, precio: null, grupo: 'Salsas y derivados', marca: '', proveedor: '', merma: 0, fechaActualizacion: '14/07/2025' },
  { id: '97', medida: 'und', ingrediente: 'Pan bimbo', pesoCompra: null, precio: null, grupo: 'Harinas y derivados', marca: '', proveedor: 'La colonia', merma: 0, fechaActualizacion: '14/07/2025' },
  { id: '98', medida: 'gr', ingrediente: 'Vinagre de vino tinto', pesoCompra: null, precio: null, grupo: 'Salsas y derivados', marca: '', proveedor: 'La colonia', merma: 0, fechaActualizacion: '14/07/2025' },
  { id: '99', medida: 'gr', ingrediente: 'Queso parmesano', pesoCompra: 452, precio: 254.95, grupo: 'Lacteos y derivados', marca: 'Member selection', proveedor: 'Pricesmart', merma: 10, fechaActualizacion: '14/07/2025' },
  { id: '100', medida: 'gr', ingrediente: 'Eneldo', pesoCompra: null, precio: null, grupo: 'Frutas y verduras', marca: '', proveedor: '', merma: 35, fechaActualizacion: '14/07/2025' },
  { id: '101', medida: 'gr', ingrediente: 'Yogurt', pesoCompra: 907, precio: 154.95, grupo: 'Lacteos y derivados', marca: 'Member selection', proveedor: 'Pricesmart', merma: 0, fechaActualizacion: '14/07/2025' },
  { id: '102', medida: 'gr', ingrediente: 'Aceite de oliva virgen', pesoCompra: 2000, precio: 509.95, grupo: 'Salsas y derivados', marca: 'Member selection', proveedor: 'Pricesmart', merma: 0, fechaActualizacion: '14/07/2025' },
  { id: '103', medida: 'gr', ingrediente: 'Pecanas', pesoCompra: 907, precio: 424.95, grupo: 'Frutos secos', marca: 'Member selection', proveedor: 'Pricesmart', merma: 0, fechaActualizacion: '14/07/2025' },
  { id: '104', medida: 'gr', ingrediente: 'Mani', pesoCompra: 1130, precio: 197.95, grupo: 'Frutos secos', marca: 'Member selection', proveedor: 'Pricesmart', merma: 0, fechaActualizacion: '14/07/2025' },
  { id: '105', medida: 'gr', ingrediente: 'Papa baby', pesoCompra: 453, precio: 20.00, grupo: 'Frutas y verduras', marca: 'Ceip', proveedor: 'Mayoreo', merma: 15, fechaActualizacion: '14/07/2025' },
  { id: '106', medida: 'gr', ingrediente: 'Menta', pesoCompra: null, precio: null, grupo: 'Frutas y verduras', marca: '', proveedor: '', merma: 35, fechaActualizacion: '14/07/2025' },
  { id: '107', medida: 'gr', ingrediente: 'Albahaca', pesoCompra: null, precio: null, grupo: 'Frutas y verduras', marca: '', proveedor: '', merma: 44, fechaActualizacion: '14/07/2025' },
  { id: '108', medida: 'gr', ingrediente: 'Queso feta', pesoCompra: 680, precio: 284.95, grupo: 'Lacteos y derivados', marca: 'President', proveedor: 'Pricesmart', merma: 0, fechaActualizacion: '14/07/2025' },
  { id: '109', medida: 'gr', ingrediente: 'Queso cottage', pesoCompra: 680, precio: 134.95, grupo: 'Lacteos y derivados', marca: 'Breakstones', proveedor: 'Pricesmart', merma: 0, fechaActualizacion: '14/07/2025' },
  { id: '110', medida: 'gr', ingrediente: 'Sazon completa', pesoCompra: 793.8, precio: 199.95, grupo: 'Polvos y sazonadores', marca: 'Badia', proveedor: 'Pricesmart', merma: 0, fechaActualizacion: '14/07/2025' },
  { id: '111', medida: 'gr', ingrediente: 'Oregano', pesoCompra: null, precio: null, grupo: 'Polvos y sazonadores', marca: '', proveedor: '', merma: 0, fechaActualizacion: '14/07/2025' },
  { id: '112', medida: 'gr', ingrediente: 'Lechuga escarola', pesoCompra: 453, precio: null, grupo: 'Frutas y verduras', marca: 'Ceip', proveedor: 'Mayoreo', merma: 15, fechaActualizacion: '14/07/2025' },
  { id: '113', medida: 'gr', ingrediente: 'Semilla de linaza', pesoCompra: null, precio: null, grupo: 'Polvos y sazonadores', marca: '', proveedor: '', merma: 0, fechaActualizacion: '14/07/2025' },
  // Ingredientes adicionales de las recetas
  { id: '114', medida: 'gr', ingrediente: 'Sal con ajo', pesoCompra: 283, precio: 183.90, grupo: 'Polvos y sazonadores', marca: '', proveedor: '', merma: 0, fechaActualizacion: '14/07/2025' },
  { id: '115', medida: 'gr', ingrediente: 'Sal de cebolla', pesoCompra: 77.96, precio: 58.90, grupo: 'Polvos y sazonadores', marca: '', proveedor: '', merma: 0, fechaActualizacion: '14/07/2025' },
  { id: '116', medida: 'gr', ingrediente: 'Cebolla', pesoCompra: 2200, precio: 142.95, grupo: 'Frutas y verduras', marca: '', proveedor: '', merma: 17, fechaActualizacion: '14/07/2025' },
  { id: '117', medida: 'gr', ingrediente: 'Repollo', pesoCompra: 1500, precio: 34.65, grupo: 'Frutas y verduras', marca: '', proveedor: '', merma: 35, fechaActualizacion: '14/07/2025' },
  { id: '118', medida: 'gr', ingrediente: 'Agua', pesoCompra: 3780, precio: 26.90, grupo: 'Salsas y derivados', marca: '', proveedor: '', merma: 0, fechaActualizacion: '14/07/2025' },
  { id: '119', medida: 'gr', ingrediente: 'Caldo', pesoCompra: 100, precio: 11.36, grupo: 'Polvos y sazonadores', marca: '', proveedor: '', merma: 0, fechaActualizacion: '14/07/2025' },
  { id: '120', medida: 'gr', ingrediente: 'Platano frito', pesoCompra: 1600, precio: 69.95, grupo: 'Frutas y verduras', marca: '', proveedor: '', merma: 0, fechaActualizacion: '14/07/2025' },
  { id: '121', medida: 'gr', ingrediente: 'Leche', pesoCompra: 12000, precio: 507.95, grupo: 'Lacteos y derivados', marca: '', proveedor: '', merma: 0, fechaActualizacion: '14/07/2025' },
  // Proteinas adicionales
  { id: '122', medida: 'gr', ingrediente: 'Pollo entero', pesoCompra: 1000, precio: null, grupo: 'Proteinas', marca: '', proveedor: '', merma: 35, fechaActualizacion: '14/07/2025' },
  { id: '123', medida: 'gr', ingrediente: 'Costilla de res', pesoCompra: 454, precio: null, grupo: 'Proteinas', marca: '', proveedor: '', merma: 35, fechaActualizacion: '14/07/2025' },
  { id: '124', medida: 'gr', ingrediente: 'Cerdo', pesoCompra: 454, precio: null, grupo: 'Proteinas', marca: '', proveedor: '', merma: 30, fechaActualizacion: '14/07/2025' },
  { id: '125', medida: 'gr', ingrediente: 'Salmon', pesoCompra: 454, precio: null, grupo: 'Proteinas', marca: '', proveedor: '', merma: 15, fechaActualizacion: '14/07/2025' },
  { id: '126', medida: 'gr', ingrediente: 'Camaron', pesoCompra: 454, precio: null, grupo: 'Proteinas', marca: '', proveedor: '', merma: 40, fechaActualizacion: '14/07/2025' },
  { id: '67', medida: 'gr', ingrediente: 'Aguacate', pesoCompra: 453, precio: 25.00, grupo: 'Frutas y verduras', marca: 'Ceip', proveedor: 'Mayoreo', merma: 32, fechaActualizacion: '14/07/2025' },
  { id: '68', medida: 'gr', ingrediente: 'Cancha', pesoCompra: null, precio: null, grupo: '', marca: '', proveedor: 'Los andes sps', fechaActualizacion: '14/07/2025' },
  { id: '69', medida: 'gr', ingrediente: 'Aceite de sesamo', pesoCompra: null, precio: null, grupo: '', marca: '', proveedor: '', fechaActualizacion: '14/07/2025' },
  { id: '70', medida: 'gr', ingrediente: 'Concentrado de mango', pesoCompra: null, precio: null, grupo: '', marca: '', proveedor: 'La colonia', fechaActualizacion: '14/07/2025' },
  { id: '71', medida: 'gr', ingrediente: 'Lechuga romana', pesoCompra: 453, precio: 22.00, grupo: 'Frutas y verduras', marca: 'Ceip', proveedor: 'Mayoreo', merma: 30, fechaActualizacion: '14/07/2025' },
  { id: '72', medida: 'gr', ingrediente: 'Salsa maggi negra', pesoCompra: null, precio: null, grupo: '', marca: '', proveedor: '', fechaActualizacion: '14/07/2025' },
  { id: '73', medida: 'und', ingrediente: 'Tortillas', pesoCompra: null, precio: null, grupo: '', marca: '', proveedor: '', fechaActualizacion: '14/07/2025' },
  { id: '74', medida: 'gr', ingrediente: 'Mantequilla de maní', pesoCompra: 1130, precio: 154.95, grupo: 'Salsas y derivados', marca: 'Member selection', proveedor: 'Pricesmart', fechaActualizacion: '14/07/2025' },
  { id: '75', medida: 'gr', ingrediente: 'Vinagre de sushi', pesoCompra: null, precio: null, grupo: '', marca: '', proveedor: 'El canton', fechaActualizacion: '14/07/2025' },
  { id: '76', medida: 'gr', ingrediente: 'Hoisin', pesoCompra: null, precio: null, grupo: '', marca: '', proveedor: '', fechaActualizacion: '14/07/2025' },
  { id: '77', medida: 'gr', ingrediente: 'Semillas de sesamo', pesoCompra: null, precio: null, grupo: '', marca: '', proveedor: '', fechaActualizacion: '14/07/2025' },
  { id: '78', medida: 'gr', ingrediente: 'Glutamato', pesoCompra: null, precio: null, grupo: '', marca: '', proveedor: '', fechaActualizacion: '14/07/2025' },
  { id: '79', medida: 'gr', ingrediente: 'Fideos', pesoCompra: null, precio: null, grupo: '', marca: '', proveedor: 'La colonia', fechaActualizacion: '14/07/2025' },
  { id: '80', medida: 'gr', ingrediente: 'Edamame', pesoCompra: null, precio: null, grupo: '', marca: '', proveedor: 'Didac', merma: 50, fechaActualizacion: '14/07/2025' },
  { id: '81', medida: 'gr', ingrediente: 'Repollo morado', pesoCompra: 1216, precio: 65.00, grupo: 'Frutas y verduras', marca: 'Ceip', proveedor: 'Mayoreo', merma: 25, fechaActualizacion: '14/07/2025' },
  { id: '82', medida: 'gr', ingrediente: 'Panko', pesoCompra: null, precio: null, grupo: '', marca: '', proveedor: '', fechaActualizacion: '14/07/2025' },
  { id: '83', medida: 'gr', ingrediente: 'Pan rallado', pesoCompra: null, precio: null, grupo: '', marca: '', proveedor: '', fechaActualizacion: '14/07/2025' },
  { id: '84', medida: 'gr', ingrediente: 'Champiñones', pesoCompra: 340, precio: 144.95, grupo: 'Frutas y verduras', marca: '', proveedor: 'Pricesmart', merma: 10, fechaActualizacion: '14/07/2025' },
  { id: '85', medida: 'gr', ingrediente: 'Shitake', pesoCompra: null, precio: null, grupo: '', marca: '', proveedor: 'Belca', merma: 0, fechaActualizacion: '14/07/2025' },
  { id: '86', medida: 'gr', ingrediente: 'Polvo de hongos', pesoCompra: null, precio: null, grupo: '', marca: '', proveedor: 'La colonia', fechaActualizacion: '14/07/2025' },
  { id: '87', medida: 'gr', ingrediente: 'Aceite mazola', pesoCompra: 5000, precio: 527.95, grupo: 'Salsas y derivados', marca: 'Mazola', proveedor: 'Pricesmart', fechaActualizacion: '14/07/2025' },
  { id: '88', medida: 'gr', ingrediente: 'Naranja agria', pesoCompra: 453, precio: null, grupo: 'Frutas y verduras', marca: 'Ceip', proveedor: 'Mayoreo', merma: 40, fechaActualizacion: '14/07/2025' },
  { id: '89', medida: 'gr', ingrediente: 'Garbanzos', pesoCompra: 1756, precio: 172.95, grupo: 'Proteinas', marca: 'Goya', proveedor: 'Pricesmart', fechaActualizacion: '14/07/2025' },
  { id: '90', medida: 'gr', ingrediente: 'Hielo', pesoCompra: null, precio: null, grupo: '', marca: '', proveedor: '', fechaActualizacion: '14/07/2025' },
  { id: '91', medida: 'gr', ingrediente: 'Tajine', pesoCompra: null, precio: null, grupo: '', marca: '', proveedor: '', fechaActualizacion: '14/07/2025' },
  { id: '92', medida: 'und', ingrediente: 'Pan pita', pesoCompra: null, precio: null, grupo: '', marca: '', proveedor: '', fechaActualizacion: '14/07/2025' },
  // Página 4
  { id: '93', medida: 'gr', ingrediente: 'Filete de res', pesoCompra: 454, precio: 225.00, grupo: 'Proteinas', marca: '', proveedor: 'Delicatessen', merma: 27, fechaActualizacion: '14/07/2025' },
  { id: '94', medida: 'gr', ingrediente: 'Almendras laminadas', pesoCompra: 907, precio: 309.95, grupo: '', marca: 'Member selection', proveedor: 'Pricesmart', fechaActualizacion: '14/07/2025' },
  { id: '95', medida: 'gr', ingrediente: 'Berenjena', pesoCompra: 200, precio: 10.00, grupo: 'Frutas y verduras', marca: 'Ceip', proveedor: 'Mayoreo', merma: 19, fechaActualizacion: '14/07/2025' },
  { id: '96', medida: 'gr', ingrediente: 'Concentrado de tomate', pesoCompra: null, precio: null, grupo: '', marca: '', proveedor: '', fechaActualizacion: '14/07/2025' },
  { id: '97', medida: 'und', ingrediente: 'Pan bimbo', pesoCompra: null, precio: null, grupo: '', marca: '', proveedor: 'La colonia', fechaActualizacion: '14/07/2025' },
  { id: '98', medida: 'gr', ingrediente: 'Vinagre de vino tinto', pesoCompra: null, precio: null, grupo: '', marca: '', proveedor: 'La colonia', fechaActualizacion: '14/07/2025' },
  { id: '99', medida: 'gr', ingrediente: 'Queso parmesano', pesoCompra: 452, precio: 254.95, grupo: 'Lacteos y derivados', marca: 'Member selection', proveedor: 'Pricesmart', merma: 10, fechaActualizacion: '14/07/2025' },
  { id: '100', medida: 'gr', ingrediente: 'Eneldo', pesoCompra: null, precio: null, grupo: '', marca: '', proveedor: '', merma: 35, fechaActualizacion: '14/07/2025' },
  { id: '101', medida: 'gr', ingrediente: 'Yogurt', pesoCompra: 907, precio: 154.95, grupo: 'Lacteos y derivados', marca: 'Member selection', proveedor: 'Pricesmart', fechaActualizacion: '14/07/2025' },
  { id: '102', medida: 'gr', ingrediente: 'Aceite de oliva virgen', pesoCompra: 2000, precio: 509.95, grupo: 'Salsas y derivados', marca: 'Member selection', proveedor: 'Pricesmart', fechaActualizacion: '14/07/2025' },
  { id: '103', medida: 'gr', ingrediente: 'Pecanas', pesoCompra: 907, precio: 424.95, grupo: '', marca: 'Member selection', proveedor: 'Pricesmart', fechaActualizacion: '14/07/2025' },
  { id: '104', medida: 'gr', ingrediente: 'Mani', pesoCompra: 1130, precio: 197.95, grupo: '', marca: 'Member selection', proveedor: 'Pricesmart', fechaActualizacion: '14/07/2025' },
  { id: '105', medida: 'gr', ingrediente: 'Papa baby', pesoCompra: 453, precio: 20.00, grupo: 'Frutas y verduras', marca: 'Ceip', proveedor: 'Mayoreo', merma: 5, fechaActualizacion: '14/07/2025' },
  { id: '106', medida: 'gr', ingrediente: 'Menta', pesoCompra: null, precio: null, grupo: '', marca: '', proveedor: '', merma: 35, fechaActualizacion: '14/07/2025' },
  { id: '107', medida: 'gr', ingrediente: 'Albahaca', pesoCompra: null, precio: null, grupo: '', marca: '', proveedor: '', merma: 10, fechaActualizacion: '14/07/2025' },
  { id: '108', medida: 'gr', ingrediente: 'Queso feta', pesoCompra: 680, precio: 284.95, grupo: 'Lacteos y derivados', marca: 'President', proveedor: 'Pricesmart', fechaActualizacion: '14/07/2025' },
  { id: '109', medida: 'gr', ingrediente: 'Queso cottage', pesoCompra: 680, precio: 134.95, grupo: 'Lacteos y derivados', marca: 'Breakstones', proveedor: 'Pricesmart', fechaActualizacion: '14/07/2025' },
  { id: '110', medida: 'gr', ingrediente: 'Sazon completa', pesoCompra: 793.8, precio: 199.95, grupo: 'Polvos y sazonadores', marca: 'Badia', proveedor: 'Pricesmart', fechaActualizacion: '14/07/2025' },
  { id: '111', medida: 'gr', ingrediente: 'Oregano', pesoCompra: null, precio: null, grupo: '', marca: '', proveedor: '', fechaActualizacion: '14/07/2025' },
  { id: '112', medida: 'gr', ingrediente: 'Lechuga escarola', pesoCompra: 453, precio: null, grupo: 'Frutas y verduras', marca: 'Ceip', proveedor: 'Mayoreo', merma: 15, fechaActualizacion: '14/07/2025' },
  { id: '113', medida: 'gr', ingrediente: 'Semilla de linaza', pesoCompra: null, precio: null, grupo: '', marca: '', proveedor: '', fechaActualizacion: '14/07/2025' },
  // Ingredientes adicionales de las recetas
  { id: '114', medida: 'gr', ingrediente: 'Sal con ajo', pesoCompra: 283, precio: 183.90, grupo: 'Polvos y sazonadores', marca: '', proveedor: '', fechaActualizacion: '14/07/2025' },
  { id: '115', medida: 'gr', ingrediente: 'Sal de cebolla', pesoCompra: 77.96, precio: 58.90, grupo: 'Polvos y sazonadores', marca: '', proveedor: '', fechaActualizacion: '14/07/2025' },
  { id: '116', medida: 'gr', ingrediente: 'Cebolla', pesoCompra: 2200, precio: 142.95, grupo: 'Frutas y verduras', marca: '', proveedor: '', fechaActualizacion: '14/07/2025' },
  { id: '117', medida: 'gr', ingrediente: 'Repollo', pesoCompra: 1500, precio: 34.65, grupo: 'Frutas y verduras', marca: '', proveedor: '', fechaActualizacion: '14/07/2025' },
  { id: '118', medida: 'gr', ingrediente: 'Agua', pesoCompra: 3780, precio: 26.90, grupo: 'Salsas y derivados', marca: '', proveedor: '', fechaActualizacion: '14/07/2025' },
  { id: '119', medida: 'gr', ingrediente: 'Caldo', pesoCompra: 100, precio: 11.36, grupo: 'Polvos y sazonadores', marca: '', proveedor: '', fechaActualizacion: '14/07/2025' },
  { id: '120', medida: 'gr', ingrediente: 'Platano frito', pesoCompra: 1600, precio: 69.95, grupo: 'Frutas y verduras', marca: '', proveedor: '', fechaActualizacion: '14/07/2025' },
  { id: '121', medida: 'gr', ingrediente: 'Leche', pesoCompra: 12000, precio: 507.95, grupo: 'Lacteos y derivados', marca: '', proveedor: '', fechaActualizacion: '14/07/2025' },
  // Ingredientes agregados desde receta SANSEBASTIAN - PENDIENTE VALIDACIÓN
  { id: '122', medida: 'gr', ingrediente: 'Chile rojo', pesoCompra: 1300, precio: 84.95, grupo: 'Frutas y verduras', marca: '', proveedor: '', fechaActualizacion: '16/01/2026', pendienteValidacion: true },
  { id: '123', medida: 'gr', ingrediente: 'Pimiento asado', pesoCompra: 0, precio: 0, grupo: 'Frutas y verduras', marca: '', proveedor: '', fechaActualizacion: '16/01/2026', pendienteValidacion: true },
  { id: '124', medida: 'gr', ingrediente: 'Peperoncinis jugo', pesoCompra: 453.5, precio: 87.9, grupo: 'Salsas y derivados', marca: '', proveedor: '', fechaActualizacion: '16/01/2026', pendienteValidacion: true },
  // Ingredientes agregados desde recetas NEW YORK y CTG - PENDIENTE VALIDACIÓN
  { id: '125', medida: 'gr', ingrediente: 'Mostaza Brown Essential Eve', pesoCompra: 340, precio: 67.9, grupo: 'Salsas y derivados', marca: '', proveedor: '', fechaActualizacion: '16/01/2026', pendienteValidacion: true },
  { id: '126', medida: 'gr', ingrediente: 'Agua de piña', pesoCompra: 0, precio: 0, grupo: 'Salsas y derivados', marca: '', proveedor: '', fechaActualizacion: '16/01/2026', pendienteValidacion: true },
  // Ingredientes agregados desde recetas LATIN JAPO y CANCUN - PENDIENTE VALIDACIÓN
  { id: '127', medida: 'gr', ingrediente: 'Siracha', pesoCompra: 3850, precio: 1200, grupo: 'Salsas y derivados', marca: '', proveedor: '', fechaActualizacion: '16/01/2026', pendienteValidacion: true },
  { id: '128', medida: 'gr', ingrediente: 'Queso crema', pesoCompra: 650, precio: 169.95, grupo: 'Lacteos y derivados', marca: '', proveedor: '', fechaActualizacion: '16/01/2026', pendienteValidacion: true },
  { id: '129', medida: 'gr', ingrediente: 'Bacon', pesoCompra: 1360, precio: 519, grupo: 'Proteinas', marca: '', proveedor: '', fechaActualizacion: '16/01/2026', pendienteValidacion: true },
  { id: '130', medida: 'gr', ingrediente: 'Teriyaki', pesoCompra: 4760, precio: 700, grupo: 'Salsas y derivados', marca: '', proveedor: '', fechaActualizacion: '16/01/2026', pendienteValidacion: true },
  { id: '131', medida: 'gr', ingrediente: 'Cebolla morada', pesoCompra: 453, precio: 20, grupo: 'Frutas y verduras', marca: '', proveedor: '', fechaActualizacion: '16/01/2026', pendienteValidacion: true },
  { id: '132', medida: 'gr', ingrediente: 'Hojas de laurel', pesoCompra: 20, precio: 18.1, grupo: 'Polvos y sazonadores', marca: '', proveedor: '', fechaActualizacion: '16/01/2026', pendienteValidacion: true },
  { id: '133', medida: 'gr', ingrediente: 'Remolacha', pesoCompra: 453, precio: 12.72, grupo: 'Frutas y verduras', marca: '', proveedor: '', fechaActualizacion: '16/01/2026', pendienteValidacion: true },
  { id: '134', medida: 'gr', ingrediente: 'Sesamo negro', pesoCompra: 227, precio: 100, grupo: 'Polvos y sazonadores', marca: '', proveedor: '', fechaActualizacion: '16/01/2026', pendienteValidacion: true },
  { id: '135', medida: 'gr', ingrediente: 'Cebollina', pesoCompra: 60, precio: 30, grupo: 'Frutas y verduras', marca: '', proveedor: '', fechaActualizacion: '16/01/2026', pendienteValidacion: true },
  { id: '136', medida: 'gr', ingrediente: 'Vinagre blanco', pesoCompra: 3700, precio: 134.95, grupo: 'Salsas y derivados', marca: '', proveedor: '', fechaActualizacion: '16/01/2026', pendienteValidacion: true },
  { id: '137', medida: 'gr', ingrediente: 'Jalapeño con pepa', pesoCompra: 226, precio: 12.99, grupo: 'Frutas y verduras', marca: '', proveedor: '', fechaActualizacion: '16/01/2026', pendienteValidacion: true },
  { id: '138', medida: 'gr', ingrediente: 'Jalapeno rodajas', pesoCompra: 226, precio: 12.99, grupo: 'Frutas y verduras', marca: '', proveedor: '', fechaActualizacion: '16/01/2026', pendienteValidacion: true },
  // Ingredientes agregados desde recetas MAIZ LOCO y POSTRE-LND - PENDIENTE VALIDACIÓN
  { id: '139', medida: 'gr', ingrediente: 'Elotitos', pesoCompra: null, precio: null, grupo: 'Snacks', marca: '', proveedor: '', fechaActualizacion: '18/01/2026', pendienteValidacion: true },
  { id: '140', medida: 'gr', ingrediente: 'Polvo esquite', pesoCompra: null, precio: null, grupo: 'Polvos y sazonadores', marca: '', proveedor: '', fechaActualizacion: '18/01/2026', pendienteValidacion: true },
  { id: '141', medida: 'gr', ingrediente: 'Maiz loco preparado', pesoCompra: null, precio: null, grupo: 'Salsas y derivados', marca: '', proveedor: '', fechaActualizacion: '18/01/2026', pendienteValidacion: true },
  { id: '142', medida: 'gr', ingrediente: 'Salsa blanca tegu', pesoCompra: null, precio: null, grupo: 'Salsas y derivados', marca: '', proveedor: '', fechaActualizacion: '18/01/2026', pendienteValidacion: true },
  // Ingredientes agregados desde ENSALADA CANCUN y ENSALADA CHINATOWN
  { id: '143', medida: 'gr', ingrediente: 'Fideos fritos', pesoCompra: 350, precio: 67.85, grupo: 'Harinas y derivados', marca: '', proveedor: '', fechaActualizacion: '18/01/2026', pendienteValidacion: true },
  { id: '144', medida: 'gr', ingrediente: 'Mantequilla de mani', pesoCompra: 1130, precio: 154.95, grupo: 'Salsas y derivados', marca: '', proveedor: '', fechaActualizacion: '18/01/2026', pendienteValidacion: true },
  // Ingredientes agregados desde CROQUETA SETAS, NEW YORK SANDWICH, SANSEBASTIAN SANDWICH
  { id: '145', medida: 'gr', ingrediente: 'Polvo hongos', pesoCompra: 65, precio: 17.25, grupo: 'Polvos y sazonadores', marca: '', proveedor: '', fechaActualizacion: '18/01/2026', pendienteValidacion: true },
];

// Recetas iniciales - TGU
const initialRecipes = [
  {
    id: '1',
    nombre: 'TGU',
    marca: 'Soul Chkn',
    subRecetas: [
      {
        id: 'sr1',
        nombre: 'SALSA BLANCA TEGU',
        ingredientes: [
          { id: 'i1', ingredienteNombre: 'Mayonesa', peso: 400 },
          { id: 'i2', ingredienteNombre: 'Ketchup', peso: 30 },
          { id: 'i3', ingredienteNombre: 'Cilantro', peso: 9 },
          { id: 'i4', ingredienteNombre: 'Leche', peso: 150 },
          { id: 'i5', ingredienteNombre: 'Sal con ajo', peso: 2.15 },
          { id: 'i6', ingredienteNombre: 'Sal de cebolla', peso: 1.5 },
          { id: 'i7', ingredienteNombre: 'Sal', peso: 3.53 },
        ],
        pesoReceta: 504,
        pesoPorcion: 50,
      },
      {
        id: 'sr2',
        nombre: 'BBQ CATRACHA',
        ingredientes: [
          { id: 'i8', ingredienteNombre: 'Barbacoa', peso: 200 },
          { id: 'i9', ingredienteNombre: 'Ketchup', peso: 200 },
          { id: 'i10', ingredienteNombre: 'Caldo', peso: 0 },
          { id: 'i11', ingredienteNombre: 'Agua', peso: 100 },
          { id: 'i12', ingredienteNombre: 'Sal', peso: 2.5 },
        ],
        pesoReceta: 600,
        pesoPorcion: 43,
      },
      {
        id: 'sr3',
        nombre: 'CHISMOL REPOLLO',
        ingredientes: [
          { id: 'i13', ingredienteNombre: 'Agua', peso: 150 },
          { id: 'i14', ingredienteNombre: 'Tomate', peso: 415 },
          { id: 'i15', ingredienteNombre: 'Cebolla', peso: 150 },
          { id: 'i16', ingredienteNombre: 'Repollo', peso: 100 },
          { id: 'i17', ingredienteNombre: 'Jalapeño', peso: 17 },
          { id: 'i18', ingredienteNombre: 'Sal', peso: 6.52 },
          { id: 'i19', ingredienteNombre: 'Limon', peso: 55 },
          { id: 'i20', ingredienteNombre: 'Pimienta', peso: 1.6 },
          { id: 'i21', ingredienteNombre: 'Aceite de oliva virgen', peso: 15 },
          { id: 'i22', ingredienteNombre: 'Comino', peso: 0.6 },
          { id: 'i23', ingredienteNombre: 'Vinagre', peso: 5 },
          { id: 'i24', ingredienteNombre: 'Cilantro', peso: 6 },
        ],
        pesoReceta: 910,
        pesoPorcion: 40,
      },
      {
        id: 'sr4',
        nombre: 'TOPPINGS',
        ingredientes: [
          { id: 'i25', ingredienteNombre: 'Platano frito', peso: 40 },
        ],
        pesoReceta: 40,
        pesoPorcion: 40,
      },
    ],
    fechaActualizacion: '14/07/2025'
  },
  {
    id: '2',
    nombre: 'SANSEBASTIAN',
    marca: 'Soul Chkn',
    subRecetas: [
      {
        id: 'sr_ss1',
        nombre: 'MIEL DE CHILE DULCE',
        ingredientes: [
          { id: 'ss_i1', ingredienteNombre: 'Chile rojo', peso: 160 },
          { id: 'ss_i2', ingredienteNombre: 'Aceite de oliva normal', peso: 10 },
          { id: 'ss_i3', ingredienteNombre: 'Sal', peso: 3.53 },
          { id: 'ss_i4', ingredienteNombre: 'Pimienta', peso: 0.76 },
          { id: 'ss_i5', ingredienteNombre: 'Pimiento asado', peso: 63 },
          { id: 'ss_i6', ingredienteNombre: 'Miel', peso: 250 },
          { id: 'ss_i7', ingredienteNombre: 'Agua', peso: 30 },
        ],
        pesoReceta: 200,
        pesoPorcion: 90,
      },
      {
        id: 'sr_ss2',
        nombre: 'CESAR',
        ingredientes: [
          { id: 'ss_i8', ingredienteNombre: 'Mayonesa', peso: 400 },
          { id: 'ss_i9', ingredienteNombre: 'Peperoncinis jugo', peso: 6 },
          { id: 'ss_i10', ingredienteNombre: 'Peperoncini', peso: 55 },
          { id: 'ss_i11', ingredienteNombre: 'Anchoas', peso: 18 },
          { id: 'ss_i12', ingredienteNombre: 'Sal', peso: 3.53 },
          { id: 'ss_i13', ingredienteNombre: 'Pimienta', peso: 1.6 },
          { id: 'ss_i14', ingredienteNombre: 'Aceitunas', peso: 15 },
        ],
        pesoReceta: 525,
        pesoPorcion: 60,
      },
      {
        id: 'sr_ss3',
        nombre: 'TOPPINGS',
        ingredientes: [
          { id: 'ss_i15', ingredienteNombre: 'Ajo', peso: 3 },
          { id: 'ss_i16', ingredienteNombre: 'Perejil', peso: 3 },
        ],
        pesoReceta: 6,
        pesoPorcion: 6,
      },
    ],
    fechaActualizacion: '16/01/2026'
  },
  {
    id: '3',
    nombre: 'NEW YORK',
    marca: 'Soul Chkn',
    subRecetas: [
      {
        id: 'sr_ny1',
        nombre: 'MIEL DE KETCHUP Y JACK DANIELS',
        ingredientes: [
          { id: 'ny_i1', ingredienteNombre: 'Jack Daniels', peso: 125 },
          { id: 'ny_i2', ingredienteNombre: 'Miel', peso: 93 },
          { id: 'ny_i3', ingredienteNombre: 'Ketchup', peso: 150 },
        ],
        pesoReceta: 200,
        pesoPorcion: 25,
      },
      {
        id: 'sr_ny2',
        nombre: 'MAYONESA DE MOSTAZA',
        ingredientes: [
          { id: 'ny_i4', ingredienteNombre: 'Mayonesa', peso: 200 },
          { id: 'ny_i5', ingredienteNombre: 'Mostaza Brown Essential Eve', peso: 25 },
          { id: 'ny_i6', ingredienteNombre: 'Agua', peso: 30 },
        ],
        pesoReceta: 240,
        pesoPorcion: 70,
      },
      {
        id: 'sr_ny3',
        nombre: 'TOPPINGS',
        ingredientes: [
          { id: 'ny_i7', ingredienteNombre: 'Pepinillos', peso: 35 },
        ],
        pesoReceta: 35,
        pesoPorcion: 35,
      },
    ],
    fechaActualizacion: '16/01/2026'
  },
  {
    id: '4',
    nombre: 'CTG',
    marca: 'Soul Chkn',
    subRecetas: [
      {
        id: 'sr_ctg1',
        nombre: 'SALSA TARTARA BARRANQUILLA',
        ingredientes: [
          { id: 'ctg_i1', ingredienteNombre: 'Mayonesa', peso: 350 },
          { id: 'ctg_i2', ingredienteNombre: 'Zanahoria', peso: 40 },
          { id: 'ctg_i3', ingredienteNombre: 'Cebolla', peso: 35 },
          { id: 'ctg_i4', ingredienteNombre: 'Ajo', peso: 4 },
          { id: 'ctg_i5', ingredienteNombre: 'Cilantro', peso: 15 },
          { id: 'ctg_i6', ingredienteNombre: 'Azucar', peso: 5.6 },
          { id: 'ctg_i7', ingredienteNombre: 'Agua', peso: 50 },
          { id: 'ctg_i8', ingredienteNombre: 'Vinagre', peso: 1.25 },
          { id: 'ctg_i9', ingredienteNombre: 'Pimienta', peso: 1.6 },
          { id: 'ctg_i10', ingredienteNombre: 'Sal', peso: 3.53 },
        ],
        pesoReceta: 484,
        pesoPorcion: 125,
      },
      {
        id: 'sr_ctg2',
        nombre: 'MERMELADA PIÑA',
        ingredientes: [
          { id: 'ctg_i11', ingredienteNombre: 'Piña', peso: 1059 },
          { id: 'ctg_i12', ingredienteNombre: 'Agua', peso: 200 },
          { id: 'ctg_i13', ingredienteNombre: 'Azucar', peso: 250 },
          { id: 'ctg_i14', ingredienteNombre: 'Agua de piña', peso: 1090 },
        ],
        pesoReceta: 860,
        pesoPorcion: 25,
      },
      {
        id: 'sr_ctg3',
        nombre: 'TOPPINGS',
        ingredientes: [
          { id: 'ctg_i15', ingredienteNombre: 'Lechuga cabeza', peso: 15 },
          { id: 'ctg_i16', ingredienteNombre: 'Papa', peso: 40 },
          { id: 'ctg_i17', ingredienteNombre: 'Maiz', peso: 15 },
        ],
        pesoReceta: 70,
        pesoPorcion: 70,
      },
    ],
    fechaActualizacion: '16/01/2026'
  },
  {
    id: '5',
    nombre: 'LATIN JAPO',
    marca: 'Soul Chkn',
    subRecetas: [
      {
        id: 'sr_lj1',
        nombre: 'MAYONESA DE SIRACHA',
        ingredientes: [
          { id: 'lj_i1', ingredienteNombre: 'Mayonesa', peso: 200 },
          { id: 'lj_i2', ingredienteNombre: 'Siracha', peso: 20 },
          { id: 'lj_i3', ingredienteNombre: 'Pepino', peso: 30 },
          { id: 'lj_i4', ingredienteNombre: 'Queso crema', peso: 30 },
        ],
        pesoReceta: 280,
        pesoPorcion: 50,
      },
      {
        id: 'sr_lj2',
        nombre: 'BACON JALAPEÑO TERIYAKI',
        ingredientes: [
          { id: 'lj_i5', ingredienteNombre: 'Bacon', peso: 150 },
          { id: 'lj_i6', ingredienteNombre: 'Jalapeño', peso: 60 },
          { id: 'lj_i7', ingredienteNombre: 'Teriyaki', peso: 120 },
          { id: 'lj_i8', ingredienteNombre: 'Agua potable', peso: 30 },
          { id: 'lj_i9', ingredienteNombre: 'Cebolla', peso: 130 },
          { id: 'lj_i10', ingredienteNombre: 'Ajo', peso: 10 },
          { id: 'lj_i11', ingredienteNombre: 'Jengibre', peso: 17 },
          { id: 'lj_i12', ingredienteNombre: 'Vinagre blanco', peso: 40 },
        ],
        pesoReceta: 350,
        pesoPorcion: 50,
      },
      {
        id: 'sr_lj3',
        nombre: 'CEBOLLA ENCURTIDA',
        ingredientes: [
          { id: 'lj_i13', ingredienteNombre: 'Cebolla morada', peso: 430 },
          { id: 'lj_i14', ingredienteNombre: 'Agua potable', peso: 300 },
          { id: 'lj_i15', ingredienteNombre: 'Vinagre', peso: 300 },
          { id: 'lj_i16', ingredienteNombre: 'Azucar', peso: 16.5 },
          { id: 'lj_i17', ingredienteNombre: 'Oregano', peso: 0.33 },
          { id: 'lj_i18', ingredienteNombre: 'Pimienta', peso: 1.6 },
          { id: 'lj_i19', ingredienteNombre: 'Hojas de laurel', peso: 0.2 },
          { id: 'lj_i20', ingredienteNombre: 'Remolacha', peso: 100 },
        ],
        pesoReceta: 884,
        pesoPorcion: 20,
      },
      {
        id: 'sr_lj4',
        nombre: 'TOPPINGS',
        ingredientes: [
          { id: 'lj_i21', ingredienteNombre: 'Sesamo negro', peso: 2 },
          { id: 'lj_i22', ingredienteNombre: 'Cebollina', peso: 2 },
        ],
        pesoReceta: 4,
        pesoPorcion: 4,
      },
    ],
    fechaActualizacion: '16/01/2026'
  },
  {
    id: '6',
    nombre: 'CANCUN',
    marca: 'Soul Chkn',
    subRecetas: [
      {
        id: 'sr_can1',
        nombre: 'MAYONESA DE AGUACHILE',
        ingredientes: [
          { id: 'can_i1', ingredienteNombre: 'Mayonesa', peso: 300 },
          { id: 'can_i2', ingredienteNombre: 'Pepino', peso: 118 },
          { id: 'can_i3', ingredienteNombre: 'Cilantro', peso: 32 },
          { id: 'can_i4', ingredienteNombre: 'Jalapeño con pepa', peso: 140 },
          { id: 'can_i5', ingredienteNombre: 'Limon', peso: 40 },
          { id: 'can_i6', ingredienteNombre: 'Comino', peso: 1.25 },
          { id: 'can_i7', ingredienteNombre: 'Pimienta', peso: 1.6 },
          { id: 'can_i8', ingredienteNombre: 'Soja', peso: 5 },
        ],
        pesoReceta: 726,
        pesoPorcion: 125,
      },
      {
        id: 'sr_can2',
        nombre: 'TOPPINGS',
        ingredientes: [
          { id: 'can_i9', ingredienteNombre: 'Cilantro', peso: 0.5 },
          { id: 'can_i10', ingredienteNombre: 'Cebolla roja', peso: 5 },
          { id: 'can_i11', ingredienteNombre: 'Pepino', peso: 5 },
          { id: 'can_i12', ingredienteNombre: 'Limon', peso: 6 },
          { id: 'can_i13', ingredienteNombre: 'Jalapeno rodajas', peso: 3 },
          { id: 'can_i14', ingredienteNombre: 'Rabano', peso: 5 },
        ],
        pesoReceta: 24.5,
        pesoPorcion: 24.5,
      },
    ],
    fechaActualizacion: '16/01/2026'
  },
  {
    id: 'r7',
    nombre: 'MAIZ LOCO',
    marca: 'Soul Chkn',
    subRecetas: [
      {
        id: 'sr_ml1',
        nombre: 'POLVO CRUJIENTE',
        ingredientes: [
          { id: 'ml_i1', ingredienteNombre: 'Chetos flaming hot', peso: 50 },
          { id: 'ml_i2', ingredienteNombre: 'Elotitos', peso: 50 },
        ],
        pesoReceta: 100,
        pesoPorcion: 10,
      },
      {
        id: 'sr_ml2',
        nombre: 'SALSA VALENTINA',
        ingredientes: [
          { id: 'ml_i3', ingredienteNombre: 'Salsa blanca tegu', peso: 35 },
          { id: 'ml_i4', ingredienteNombre: 'Maiz', peso: 250 },
          { id: 'ml_i5', ingredienteNombre: 'Mantequilla rala', peso: 30 },
          { id: 'ml_i6', ingredienteNombre: 'Salsa Valentina', peso: 4 },
          { id: 'ml_i7', ingredienteNombre: 'Pimienta', peso: 0.76 },
          { id: 'ml_i8', ingredienteNombre: 'Polvo esquite', peso: 6 },
          { id: 'ml_i9', ingredienteNombre: 'Maiz loco preparado', peso: 180 },
        ],
        pesoReceta: 505.76,
        pesoPorcion: 150,
      },
    ],
    fechaActualizacion: '18/01/2026'
  },
  {
    id: 'r8',
    nombre: 'POSTRE - LND',
    marca: 'Soul Chkn',
    subRecetas: [
      {
        id: 'sr_plnd1',
        nombre: 'GALLETA',
        ingredientes: [
          { id: 'plnd_i1', ingredienteNombre: 'Galleta maria', peso: 90 },
          { id: 'plnd_i2', ingredienteNombre: 'Mantequilla amarilla', peso: 58 },
          { id: 'plnd_i3', ingredienteNombre: 'Rapadura', peso: 7 },
        ],
        pesoReceta: 120,
        pesoPorcion: 17,
      },
      {
        id: 'sr_plnd2',
        nombre: 'DULCE DE LECHE CREMOSO',
        ingredientes: [
          { id: 'plnd_i4', ingredienteNombre: 'Dulce de leche', peso: 380 },
          { id: 'plnd_i5', ingredienteNombre: 'Crema dulce', peso: 250 },
        ],
        pesoReceta: 630,
        pesoPorcion: 50,
      },
      {
        id: 'sr_plnd3',
        nombre: 'TOPPINGS',
        ingredientes: [
          { id: 'plnd_i6', ingredienteNombre: 'Banano', peso: 1 },
          { id: 'plnd_i7', ingredienteNombre: 'Crema batida', peso: 18 },
        ],
        pesoReceta: 19,
        pesoPorcion: 19,
      },
    ],
    fechaActualizacion: '18/01/2026'
  },
  {
    id: 'r9',
    nombre: 'LIMA',
    marca: 'Soul Chkn',
    subRecetas: [
      {
        id: 'sr_lima1',
        nombre: 'ADEREZO LIMA',
        ingredientes: [
          { id: 'lima_i1', ingredienteNombre: 'Mayonesa', peso: 5000 },
          { id: 'lima_i2', ingredienteNombre: 'Ajo', peso: 62 },
          { id: 'lima_i3', ingredienteNombre: 'Togarashi', peso: 62 },
          { id: 'lima_i4', ingredienteNombre: 'Soja', peso: 100 },
          { id: 'lima_i5', ingredienteNombre: 'Limon', peso: 300 },
          { id: 'lima_i6', ingredienteNombre: 'Sal', peso: 75 },
          { id: 'lima_i7', ingredienteNombre: 'Pimienta', peso: 15 },
          { id: 'lima_i8', ingredienteNombre: 'Jengibre', peso: 42 },
          { id: 'lima_i9', ingredienteNombre: 'Agua potable', peso: 1200 },
          { id: 'lima_i10', ingredienteNombre: 'Cilantro', peso: 37 },
        ],
        pesoReceta: 6893,
        pesoPorcion: 70,
      },
      {
        id: 'sr_lima2',
        nombre: 'TOPPINGS',
        ingredientes: [
          { id: 'lima_i11', ingredienteNombre: 'Camote', peso: 20 },
          { id: 'lima_i12', ingredienteNombre: 'Cebolla amarilla', peso: 12 },
          { id: 'lima_i13', ingredienteNombre: 'Aguacate', peso: 0.2 },
          { id: 'lima_i14', ingredienteNombre: 'Cancha', peso: 20 },
          { id: 'lima_i15', ingredienteNombre: 'Cilantro', peso: 1 },
          { id: 'lima_i16', ingredienteNombre: 'Togarashi', peso: 1 },
        ],
        pesoReceta: 54.2,
        pesoPorcion: 54.2,
      },
    ],
    fechaActualizacion: '18/01/2026'
  },
  {
    id: 'r10',
    nombre: 'ENSALADA LIMA',
    marca: 'Soul Chkn',
    subRecetas: [
      {
        id: 'sr_elima1',
        nombre: 'ADEREZO LIMA',
        ingredientes: [
          { id: 'elima_i1', ingredienteNombre: 'Mayonesa', peso: 5000 },
          { id: 'elima_i2', ingredienteNombre: 'Ajo', peso: 62 },
          { id: 'elima_i3', ingredienteNombre: 'Togarashi', peso: 62 },
          { id: 'elima_i4', ingredienteNombre: 'Soja', peso: 100 },
          { id: 'elima_i5', ingredienteNombre: 'Limon', peso: 300 },
          { id: 'elima_i6', ingredienteNombre: 'Sal', peso: 75 },
          { id: 'elima_i7', ingredienteNombre: 'Pimienta', peso: 15 },
          { id: 'elima_i8', ingredienteNombre: 'Jengibre', peso: 42 },
          { id: 'elima_i9', ingredienteNombre: 'Agua potable', peso: 1200 },
          { id: 'elima_i10', ingredienteNombre: 'Cilantro', peso: 37 },
        ],
        pesoReceta: 6893,
        pesoPorcion: 40,
      },
      {
        id: 'sr_elima2',
        nombre: 'ADEREZO NIKEI',
        ingredientes: [
          { id: 'elima_i11', ingredienteNombre: 'Aceite de oliva normal', peso: 80 },
          { id: 'elima_i12', ingredienteNombre: 'Limon', peso: 55 },
          { id: 'elima_i13', ingredienteNombre: 'Soja', peso: 15 },
          { id: 'elima_i14', ingredienteNombre: 'Aceite de sesamo', peso: 4 },
          { id: 'elima_i15', ingredienteNombre: 'Concentrado de mango', peso: 60 },
        ],
        pesoReceta: 214,
        pesoPorcion: 30,
      },
      {
        id: 'sr_elima3',
        nombre: 'TOPPINGS',
        ingredientes: [
          { id: 'elima_i16', ingredienteNombre: 'Lechuga romana', peso: 100 },
          { id: 'elima_i17', ingredienteNombre: 'Camote', peso: 30 },
          { id: 'elima_i18', ingredienteNombre: 'Cebolla roja', peso: 12 },
          { id: 'elima_i19', ingredienteNombre: 'Cancha', peso: 20 },
          { id: 'elima_i20', ingredienteNombre: 'Togarashi', peso: 1 },
          { id: 'elima_i21', ingredienteNombre: 'Aguacate', peso: 1.5 },
        ],
        pesoReceta: 164.5,
        pesoPorcion: 164.5,
      },
    ],
    fechaActualizacion: '18/01/2026'
  },
  {
    id: 'r11',
    nombre: 'ENSALADA CANCUN',
    marca: 'Soul Chkn',
    subRecetas: [
      {
        id: 'sr_ecancun1',
        nombre: 'VINAGRETA CANCUN',
        ingredientes: [
          { id: 'ecancun_i1', ingredienteNombre: 'Aceite de oliva normal', peso: 80 },
          { id: 'ecancun_i2', ingredienteNombre: 'Limon', peso: 60 },
          { id: 'ecancun_i3', ingredienteNombre: 'Salsa maggi negra', peso: 15 },
        ],
        pesoReceta: 155,
        pesoPorcion: 30,
      },
      {
        id: 'sr_ecancun2',
        nombre: 'MAYONESA DE AGUACHILE',
        ingredientes: [
          { id: 'ecancun_i4', ingredienteNombre: 'Mayonesa', peso: 300 },
          { id: 'ecancun_i5', ingredienteNombre: 'Pepino', peso: 118 },
          { id: 'ecancun_i6', ingredienteNombre: 'Cilantro', peso: 32 },
          { id: 'ecancun_i7', ingredienteNombre: 'Jalapeño con pepa', peso: 140 },
          { id: 'ecancun_i8', ingredienteNombre: 'Limon', peso: 40 },
          { id: 'ecancun_i9', ingredienteNombre: 'Comino', peso: 1.25 },
          { id: 'ecancun_i10', ingredienteNombre: 'Pimienta', peso: 1.6 },
          { id: 'ecancun_i11', ingredienteNombre: 'Soja', peso: 5 },
        ],
        pesoReceta: 726,
        pesoPorcion: 50,
      },
      {
        id: 'sr_ecancun3',
        nombre: 'TOPPINGS',
        ingredientes: [
          { id: 'ecancun_i12', ingredienteNombre: 'Lechuga romana', peso: 100 },
          { id: 'ecancun_i13', ingredienteNombre: 'Pepino', peso: 12 },
          { id: 'ecancun_i14', ingredienteNombre: 'Rabano', peso: 12 },
          { id: 'ecancun_i15', ingredienteNombre: 'Jalapeno rodajas', peso: 5 },
          { id: 'ecancun_i16', ingredienteNombre: 'Cebolla amarilla', peso: 12 },
          { id: 'ecancun_i17', ingredienteNombre: 'Aguacate', peso: 1.5 },
          { id: 'ecancun_i18', ingredienteNombre: 'Chips de platano', peso: 1 },
          { id: 'ecancun_i19', ingredienteNombre: 'Piña', peso: 25 },
        ],
        pesoReceta: 168.5,
        pesoPorcion: 168.5,
      },
    ],
    fechaActualizacion: '18/01/2026'
  },
  {
    id: 'r12',
    nombre: 'ENSALADA CHINATOWN',
    marca: 'Soul Chkn',
    subRecetas: [
      {
        id: 'sr_echinatown1',
        nombre: 'ADEREZO CUMPAO',
        ingredientes: [
          { id: 'echinatown_i1', ingredienteNombre: 'Mantequilla de mani', peso: 90 },
          { id: 'echinatown_i2', ingredienteNombre: 'Aceite de sesamo', peso: 25 },
          { id: 'echinatown_i3', ingredienteNombre: 'Miel', peso: 50 },
          { id: 'echinatown_i4', ingredienteNombre: 'Vinagre de sushi', peso: 60 },
          { id: 'echinatown_i5', ingredienteNombre: 'Soja', peso: 25 },
          { id: 'echinatown_i6', ingredienteNombre: 'Agua potable', peso: 75 },
          { id: 'echinatown_i7', ingredienteNombre: 'Hoisin', peso: 11 },
        ],
        pesoReceta: 336,
        pesoPorcion: 50,
      },
      {
        id: 'sr_echinatown2',
        nombre: 'CRUNCHY OIL',
        ingredientes: [
          { id: 'echinatown_i8', ingredienteNombre: 'Aceite de oliva normal', peso: 850 },
          { id: 'echinatown_i9', ingredienteNombre: 'Cebolla roja', peso: 285 },
          { id: 'echinatown_i10', ingredienteNombre: 'Ajo', peso: 125 },
          { id: 'echinatown_i11', ingredienteNombre: 'Togarashi', peso: 40 },
          { id: 'echinatown_i12', ingredienteNombre: 'Azucar', peso: 20 },
          { id: 'echinatown_i13', ingredienteNombre: 'Sal', peso: 10 },
          { id: 'echinatown_i14', ingredienteNombre: 'Soja', peso: 50 },
          { id: 'echinatown_i15', ingredienteNombre: 'Jengibre', peso: 9 },
          { id: 'echinatown_i16', ingredienteNombre: 'Semillas de sesamo', peso: 25 },
          { id: 'echinatown_i17', ingredienteNombre: 'Paprika', peso: 25 },
          { id: 'echinatown_i18', ingredienteNombre: 'Glutamato', peso: 15 },
        ],
        pesoReceta: 1222,
        pesoPorcion: 50,
      },
      {
        id: 'sr_echinatown3',
        nombre: 'TOPPINGS',
        ingredientes: [
          { id: 'echinatown_i19', ingredienteNombre: 'Lechuga romana', peso: 70 },
          { id: 'echinatown_i20', ingredienteNombre: 'Fideos fritos', peso: 30 },
          { id: 'echinatown_i21', ingredienteNombre: 'Cebollina', peso: 5 },
          { id: 'echinatown_i22', ingredienteNombre: 'Edamame', peso: 30 },
          { id: 'echinatown_i23', ingredienteNombre: 'Zanahoria', peso: 18 },
          { id: 'echinatown_i24', ingredienteNombre: 'Repollo morado', peso: 10 },
          { id: 'echinatown_i25', ingredienteNombre: 'Aguacate', peso: 0.5 },
        ],
        pesoReceta: 163.5,
        pesoPorcion: 163.5,
      },
    ],
    fechaActualizacion: '18/01/2026'
  },
  {
    id: 'r13',
    nombre: 'CROQUETA SETAS',
    marca: 'Soul Chkn',
    subRecetas: [
      {
        id: 'sr_crsetas1',
        nombre: 'MASA CROQUETA SETAS',
        ingredientes: [
          { id: 'crsetas_i1', ingredienteNombre: 'Champiñones', peso: 1327 },
          { id: 'crsetas_i2', ingredienteNombre: 'Ajo', peso: 60 },
          { id: 'crsetas_i3', ingredienteNombre: 'Cebolla amarilla', peso: 500 },
          { id: 'crsetas_i4', ingredienteNombre: 'Shitake', peso: 28.35 },
          { id: 'crsetas_i5', ingredienteNombre: 'Sal', peso: 20 },
          { id: 'crsetas_i6', ingredienteNombre: 'Pimienta', peso: 8 },
          { id: 'crsetas_i7', ingredienteNombre: 'Tomillo', peso: 1 },
          { id: 'crsetas_i8', ingredienteNombre: 'Glutamato', peso: 3 },
          { id: 'crsetas_i9', ingredienteNombre: 'Polvo hongos', peso: 65 },
          { id: 'crsetas_i10', ingredienteNombre: 'Aceite de oliva normal', peso: 115 },
          { id: 'crsetas_i11', ingredienteNombre: 'Mantequilla amarilla', peso: 400 },
          { id: 'crsetas_i12', ingredienteNombre: 'Harina', peso: 400 },
          { id: 'crsetas_i13', ingredienteNombre: 'Leche entera', peso: 1000 },
        ],
        pesoReceta: 2675,
        pesoPorcion: 45,
      },
      {
        id: 'sr_crsetas2',
        nombre: 'EMPANADO',
        ingredientes: [
          { id: 'crsetas_i14', ingredienteNombre: 'Huevo', peso: 2 },
          { id: 'crsetas_i15', ingredienteNombre: 'Harina', peso: 2 },
          { id: 'crsetas_i16', ingredienteNombre: 'Panko', peso: 2 },
          { id: 'crsetas_i17', ingredienteNombre: 'Pan rallado', peso: 2 },
        ],
        pesoReceta: 8,
        pesoPorcion: 8,
      },
    ],
    fechaActualizacion: '18/01/2026'
  },
  {
    id: 'r14',
    nombre: 'NEW YORK SANDWICH',
    marca: 'Soul Chkn',
    subRecetas: [
      {
        id: 'sr_nysw1',
        nombre: 'MIEL DE KETCHUP Y JACK DANIELS',
        ingredientes: [
          { id: 'nysw_i1', ingredienteNombre: 'Jack Daniels', peso: 125 },
          { id: 'nysw_i2', ingredienteNombre: 'Miel', peso: 93 },
          { id: 'nysw_i3', ingredienteNombre: 'Ketchup', peso: 150 },
        ],
        pesoReceta: 200,
        pesoPorcion: 20,
      },
      {
        id: 'sr_nysw2',
        nombre: 'MAYONESA DE MOSTAZA',
        ingredientes: [
          { id: 'nysw_i4', ingredienteNombre: 'Mayonesa', peso: 200 },
          { id: 'nysw_i5', ingredienteNombre: 'Mostaza Brown Essential Eve', peso: 25 },
          { id: 'nysw_i6', ingredienteNombre: 'Agua potable', peso: 30 },
        ],
        pesoReceta: 240,
        pesoPorcion: 40,
      },
      {
        id: 'sr_nysw3',
        nombre: 'TOPPINGS',
        ingredientes: [
          { id: 'nysw_i7', ingredienteNombre: 'Pepinillos', peso: 10 },
          { id: 'nysw_i8', ingredienteNombre: 'Pan brioche', peso: 1 },
        ],
        pesoReceta: 11,
        pesoPorcion: 11,
      },
    ],
    fechaActualizacion: '18/01/2026'
  },
  {
    id: 'r15',
    nombre: 'SANSEBASTIAN SANDWICH',
    marca: 'Soul Chkn',
    subRecetas: [
      {
        id: 'sr_sssw1',
        nombre: 'MIEL DE CHILE DULCE',
        ingredientes: [
          { id: 'sssw_i1', ingredienteNombre: 'Chile rojo', peso: 160 },
          { id: 'sssw_i2', ingredienteNombre: 'Aceite de oliva normal', peso: 10 },
          { id: 'sssw_i3', ingredienteNombre: 'Sal', peso: 3.53 },
          { id: 'sssw_i4', ingredienteNombre: 'Pimienta', peso: 0.76 },
          { id: 'sssw_i5', ingredienteNombre: 'Pimiento asado', peso: 63 },
          { id: 'sssw_i6', ingredienteNombre: 'Miel', peso: 250 },
          { id: 'sssw_i7', ingredienteNombre: 'Agua potable', peso: 30 },
        ],
        pesoReceta: 200,
        pesoPorcion: 20,
      },
      {
        id: 'sr_sssw2',
        nombre: 'CESAR',
        ingredientes: [
          { id: 'sssw_i8', ingredienteNombre: 'Mayonesa', peso: 400 },
          { id: 'sssw_i9', ingredienteNombre: 'Peperoncini', peso: 6 },
          { id: 'sssw_i10', ingredienteNombre: 'Peperoncini', peso: 55 },
          { id: 'sssw_i11', ingredienteNombre: 'Anchoas', peso: 18 },
          { id: 'sssw_i12', ingredienteNombre: 'Sal', peso: 3.53 },
          { id: 'sssw_i13', ingredienteNombre: 'Pimienta', peso: 1.6 },
          { id: 'sssw_i14', ingredienteNombre: 'Aceitunas', peso: 15 },
        ],
        pesoReceta: 525,
        pesoPorcion: 50,
      },
      {
        id: 'sr_sssw3',
        nombre: 'TOPPINGS',
        ingredientes: [
          { id: 'sssw_i15', ingredienteNombre: 'Pan brioche', peso: 1 },
          { id: 'sssw_i16', ingredienteNombre: 'Perejil', peso: 3 },
        ],
        pesoReceta: 4,
        pesoPorcion: 4,
      },
    ],
    fechaActualizacion: '18/01/2026'
  }
];

// ============================================
// APLICACIÓN PRINCIPAL
// ============================================
export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentView, setCurrentView] = useState('login');
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [brands, setBrands] = useState(mockDB.brands);
  
  // Banco de ingredientes GLOBAL (compartido entre todas las marcas)
  const [ingredients, setIngredients] = useState(initialIngredients);
  
  // Recetas POR MARCA
  const [recetasPorMarca, setRecetasPorMarca] = useState({
    '1': initialRecipes, // Soul Chkn
    '2': [], // Green Memo
  });

  // Configuración de costos (valores editables)
  const [configCostos, setConfigCostos] = useState({
    // Ventas promedio mensuales (array dinámico)
    ventas: [
      { id: 'v1', nombre: 'Venta todos los artículos', valor: 3835 }
    ],
    // Costos fijos mensuales (array dinámico)
    costosFijos: [
      { id: 'c1', nombre: 'Luz', valor: 12000 },
      { id: 'c2', nombre: 'Gas', valor: 16000 },
      { id: 'c3', nombre: 'Aceite', valor: 22560 },
      { id: 'c4', nombre: 'Alquiler', valor: 33000 },
      { id: 'c5', nombre: 'WiFi', valor: 3097 },
      { id: 'c6', nombre: 'Planilla', valor: 125000 },
      { id: 'c7', nombre: 'Gasolina', valor: 5600 }
    ],
    // Porcentaje de delivery
    porcentajeDelivery: 22,
    // Porcentaje de ISV
    porcentajeISV: 15
  });

  // Bases de receta (editables)
  const [basesReceta, setBasesReceta] = useState({
    polloFrito: {
      id: 'base_pollo',
      nombre: 'Pollo Frito',
      activo: true,
      muslo: {
        pesoLimpio: 280,
        pesoCompra: 453,
        precioCompra: 42.00,
        merma: 17.5
      },
      empanizado: {
        porciones: 3,
        ingredientes: [
          { id: 'emp1', nombre: 'Harina', pesoUsado: 120, pesoCompra: 2267, precioCompra: 102.95 },
          { id: 'emp2', nombre: 'Maicena', pesoUsado: 120, pesoCompra: 750, precioCompra: 131.53 },
          { id: 'emp3', nombre: 'Harina PAN', pesoUsado: 60, pesoCompra: 9072, precioCompra: 735.64 },
          { id: 'emp4', nombre: 'Paprika', pesoUsado: 9, pesoCompra: 453, precioCompra: 154.95 },
          { id: 'emp5', nombre: 'Ajo en polvo', pesoUsado: 9, pesoCompra: 283, precioCompra: 183.90 },
          { id: 'emp6', nombre: 'Cebolla en polvo', pesoUsado: 15, pesoCompra: 77.96, precioCompra: 58.90 },
          { id: 'emp7', nombre: 'Pimienta', pesoUsado: 7.2, pesoCompra: 453, precioCompra: 169.95 },
          { id: 'emp8', nombre: 'Sal', pesoUsado: 10.59, pesoCompra: 737, precioCompra: 144.95 }
        ]
      }
    },
    polloFritoEnsalada: {
      id: 'base_pollo_ensalada',
      nombre: 'Pollo Frito Ensalada y Sandwich',
      activo: true,
      muslo: {
        pesoLimpio: 100,
        pesoCompra: 453,
        precioCompra: 42.00,
        merma: 17.5
      },
      empanizado: {
        porciones: 8,
        ingredientes: [
          { id: 'emp1b', nombre: 'Harina', pesoUsado: 120, pesoCompra: 2267, precioCompra: 102.95 },
          { id: 'emp2b', nombre: 'Maicena', pesoUsado: 120, pesoCompra: 750, precioCompra: 131.53 },
          { id: 'emp3b', nombre: 'Harina PAN', pesoUsado: 60, pesoCompra: 9072, precioCompra: 735.64 },
          { id: 'emp4b', nombre: 'Paprika', pesoUsado: 9, pesoCompra: 453, precioCompra: 154.95 },
          { id: 'emp5b', nombre: 'Ajo en polvo', pesoUsado: 9, pesoCompra: 283, precioCompra: 183.90 },
          { id: 'emp6b', nombre: 'Cebolla en polvo', pesoUsado: 15, pesoCompra: 77.96, precioCompra: 58.90 },
          { id: 'emp7b', nombre: 'Pimienta', pesoUsado: 7.2, pesoCompra: 453, precioCompra: 169.95 },
          { id: 'emp8b', nombre: 'Sal', pesoUsado: 10.59, pesoCompra: 737, precioCompra: 144.95 }
        ]
      }
    },
    papasFritas: {
      id: 'base_papas',
      nombre: 'Papas Fritas',
      activo: true,
      pesoPorPorcion: 150,
      pesoCompra: 13608, // 30 lb en gramos
      precioCompra: 910
    }
  });

  // Bases activadas por receta (objeto: { recetaId: { polloFrito: true/false, papasFritas: true/false } })
  const [basesPorReceta, setBasesPorReceta] = useState({});

  // Empaques/Materiales disponibles
  const [empaques, setEmpaques] = useState([
    { id: 'emp_pollo', nombre: 'Empaques Pollo', precio: 7.00 },
    { id: 'emp_papel', nombre: 'Papel', precio: 0.975 },
    { id: 'emp_tenedor', nombre: 'Tenedor Entrantes', precio: 1.50 },
    { id: 'emp_bolsa_papitas', nombre: 'Bolsa Papitas', precio: 1.10 },
    { id: 'emp_servilleta', nombre: 'Servilleta', precio: 0.60 },
    { id: 'emp_guante', nombre: 'Guante', precio: 0.60 },
    { id: 'emp_entrantes', nombre: 'Empaques Entrantes', precio: 8.11 },
    { id: 'emp_bolsa', nombre: 'Bolsa', precio: 3.78 }
  ]);

  // Empaques activados por receta (objeto: { recetaId: { emp_pollo: true/false, emp_papel: true/false, ... } })
  const [empaquesPorReceta, setEmpaquesPorReceta] = useState({});

  // Delivery activo por receta
  const [deliveryPorReceta, setDeliveryPorReceta] = useState({});

  // ISV activo por receta
  const [isvPorReceta, setIsvPorReceta] = useState({});

  // Precio de venta por receta
  const [precioVentaPorReceta, setPrecioVentaPorReceta] = useState({});

  // Estado de carga para Firebase
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Función para guardar datos en Firebase
  const saveToFirebase = async (dataToSave) => {
    try {
      setIsSaving(true);
      await setDoc(doc(db, 'app', 'data'), dataToSave);
      console.log('Datos guardados en Firebase');
    } catch (error) {
      console.error('Error guardando en Firebase:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Función para cargar datos de Firebase
  const loadFromFirebase = async () => {
    try {
      const docRef = doc(db, 'app', 'data');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log('Datos cargados de Firebase');
        
        if (data.ingredients) setIngredients(data.ingredients);
        if (data.recetasPorMarca) setRecetasPorMarca(data.recetasPorMarca);
        if (data.brands) setBrands(data.brands);
        if (data.configCostos) setConfigCostos(data.configCostos);
        if (data.basesReceta) setBasesReceta(data.basesReceta);
        if (data.basesPorReceta) setBasesPorReceta(data.basesPorReceta);
        if (data.empaques) setEmpaques(data.empaques);
        if (data.empaquesPorReceta) setEmpaquesPorReceta(data.empaquesPorReceta);
        if (data.deliveryPorReceta) setDeliveryPorReceta(data.deliveryPorReceta);
        if (data.isvPorReceta) setIsvPorReceta(data.isvPorReceta);
        if (data.precioVentaPorReceta) setPrecioVentaPorReceta(data.precioVentaPorReceta);
      } else {
        console.log('No hay datos en Firebase, usando valores iniciales');
        // Guardar los datos iniciales en Firebase
        await saveToFirebase({
          ingredients: initialIngredients,
          recetasPorMarca: {
            '1': initialRecipes,
            '2': [],
          },
          brands: mockDB.brands,
          configCostos,
          basesReceta,
          basesPorReceta: {},
          empaques,
          empaquesPorReceta: {},
          deliveryPorReceta: {},
          isvPorReceta: {},
          precioVentaPorReceta: {}
        });
      }
    } catch (error) {
      console.error('Error cargando de Firebase:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar datos al iniciar
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
      setCurrentView('brands');
    }
    loadFromFirebase();
  }, []);

  // Guardar datos en Firebase cuando cambien (con debounce)
  useEffect(() => {
    if (isLoading) return; // No guardar mientras carga
    
    const timeoutId = setTimeout(() => {
      saveToFirebase({
        ingredients,
        recetasPorMarca,
        brands,
        configCostos,
        basesReceta,
        basesPorReceta,
        empaques,
        empaquesPorReceta,
        deliveryPorReceta,
        isvPorReceta,
        precioVentaPorReceta
      });
    }, 1000); // Esperar 1 segundo antes de guardar
    
    return () => clearTimeout(timeoutId);
  }, [ingredients, recetasPorMarca, brands, configCostos, basesReceta, basesPorReceta, empaques, empaquesPorReceta, deliveryPorReceta, isvPorReceta, precioVentaPorReceta, isLoading]);

  const handleLogin = (user) => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
    setCurrentView('brands');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    setCurrentView('login');
    setSelectedBrand(null);
  };

  const handleSelectBrand = (brand) => {
    setSelectedBrand(brand);
    setCurrentView('dashboard');
  };

  const handleAddBrand = (newBrand) => {
    const brand = {
      id: Date.now().toString(),
      name: newBrand.name,
      color: newBrand.color
    };
    setBrands([...brands, brand]);
    // Inicializar recetas vacías para la nueva marca
    setRecetasPorMarca(prev => ({ ...prev, [brand.id]: [] }));
  };

  const handleBackToBrands = () => {
    setSelectedBrand(null);
    setCurrentView('brands');
  };

  // Funciones para manejar ingredientes (GLOBAL)
  const handleAddIngredient = (newIngredient) => {
    const ingredient = {
      ...newIngredient,
      id: Date.now().toString(),
      fechaActualizacion: new Date().toLocaleDateString('es-HN')
    };
    setIngredients([...ingredients, ingredient]);
  };

  const handleDeleteIngredient = (id) => {
    setIngredients(ingredients.filter(ing => ing.id !== id));
  };

  const handleUpdateIngredient = (updatedIngredient) => {
    setIngredients(ingredients.map(ing => 
      ing.id === updatedIngredient.id 
        ? { ...updatedIngredient, fechaActualizacion: new Date().toLocaleDateString('es-HN') }
        : ing
    ));
  };

  // Funciones para manejar recetas (POR MARCA)
  const getRecetasForBrand = () => {
    return recetasPorMarca[selectedBrand?.id] || [];
  };

  const handleAddReceta = (newReceta) => {
    const receta = {
      ...newReceta,
      id: Date.now().toString(),
      fechaActualizacion: new Date().toLocaleDateString('es-HN')
    };
    setRecetasPorMarca(prev => ({
      ...prev,
      [selectedBrand.id]: [...(prev[selectedBrand.id] || []), receta]
    }));
  };

  const handleDeleteReceta = (id) => {
    setRecetasPorMarca(prev => ({
      ...prev,
      [selectedBrand.id]: prev[selectedBrand.id].filter(r => r.id !== id)
    }));
  };

  const handleUpdateReceta = (updatedReceta) => {
    setRecetasPorMarca(prev => ({
      ...prev,
      [selectedBrand.id]: prev[selectedBrand.id].map(r => 
        r.id === updatedReceta.id 
          ? { ...updatedReceta, fechaActualizacion: new Date().toLocaleDateString('es-HN') }
          : r
      )
    }));
  };

  // Funciones para configuración de costos
  const handleUpdateConfigCostos = (newConfig) => {
    setConfigCostos(newConfig);
  };

  const handleToggleDelivery = (recetaId) => {
    setDeliveryPorReceta(prev => ({
      ...prev,
      [recetaId]: !prev[recetaId]
    }));
  };

  const handleToggleISV = (recetaId) => {
    setIsvPorReceta(prev => ({
      ...prev,
      [recetaId]: !prev[recetaId]
    }));
  };

  const handleUpdatePrecioVenta = (recetaId, precio) => {
    setPrecioVentaPorReceta(prev => ({
      ...prev,
      [recetaId]: parseFloat(precio) || 0
    }));
  };

  // Handler para actualizar precio cliente y calcular hacia atrás el precio venta
  const handleUpdatePrecioCliente = (recetaId, precioClienteInput) => {
    const precioCliente = parseFloat(precioClienteInput) || 0;
    const tieneDelivery = deliveryPorReceta[recetaId] || false;
    const tieneISV = isvPorReceta[recetaId] || false;
    
    // Calcular hacia atrás
    // precioCliente = precioBase + (precioBase * delivery%) = precioBase * (1 + delivery%)
    // precioBase = precioCliente / (1 + delivery%)
    let precioBase = precioCliente;
    if (tieneDelivery) {
      precioBase = precioCliente / (1 + configCostos.porcentajeDelivery / 100);
    }
    
    // precioBase = precioVenta + (precioVenta * ISV%) = precioVenta * (1 + ISV%)
    // precioVenta = precioBase / (1 + ISV%)
    let precioVenta = precioBase;
    if (tieneISV) {
      precioVenta = precioBase / (1 + configCostos.porcentajeISV / 100);
    }
    
    setPrecioVentaPorReceta(prev => ({
      ...prev,
      [recetaId]: Math.round(precioVenta * 100) / 100 // Redondear a 2 decimales
    }));
  };

  // Handlers para bases de receta
  const handleUpdateBasesReceta = (newBases) => {
    setBasesReceta(newBases);
  };

  const handleToggleBaseReceta = (recetaId, baseKey) => {
    setBasesPorReceta(prev => ({
      ...prev,
      [recetaId]: {
        ...prev[recetaId],
        [baseKey]: !(prev[recetaId]?.[baseKey] || false)
      }
    }));
  };

  // Toggle empaque por receta
  const handleToggleEmpaque = (recetaId, empaqueId) => {
    setEmpaquesPorReceta(prev => ({
      ...prev,
      [recetaId]: {
        ...prev[recetaId],
        [empaqueId]: !(prev[recetaId]?.[empaqueId] || false)
      }
    }));
  };

  // Calcular costo total de empaques seleccionados para una receta
  const calcularCostoEmpaques = (recetaId) => {
    const empaquesActivos = empaquesPorReceta[recetaId] || {};
    return empaques.reduce((sum, emp) => {
      if (empaquesActivos[emp.id]) {
        return sum + emp.precio;
      }
      return sum;
    }, 0);
  };

  // Calcular costo de base Pollo Frito
  const calcularCostoPolloFrito = () => {
    const { muslo, empanizado } = basesReceta.polloFrito;
    // Costo del muslo (proporcional al peso usado)
    const costoMuslo = (muslo.pesoLimpio / muslo.pesoCompra) * muslo.precioCompra;
    // Costo del empanizado total
    const costoEmpanizadoTotal = empanizado.ingredientes.reduce((sum, ing) => {
      return sum + (ing.pesoUsado / ing.pesoCompra) * ing.precioCompra;
    }, 0);
    // Costo empanizado por porción
    const costoEmpanizadoPorPorcion = costoEmpanizadoTotal / empanizado.porciones;
    return costoMuslo + costoEmpanizadoPorPorcion;
  };

  // Calcular costo de base Pollo Frito Ensalada y Sandwich
  const calcularCostoPolloFritoEnsalada = () => {
    const { muslo, empanizado } = basesReceta.polloFritoEnsalada;
    // Costo del muslo (proporcional al peso usado)
    const costoMuslo = (muslo.pesoLimpio / muslo.pesoCompra) * muslo.precioCompra;
    // Costo del empanizado total
    const costoEmpanizadoTotal = empanizado.ingredientes.reduce((sum, ing) => {
      return sum + (ing.pesoUsado / ing.pesoCompra) * ing.precioCompra;
    }, 0);
    // Costo empanizado por porción
    const costoEmpanizadoPorPorcion = costoEmpanizadoTotal / empanizado.porciones;
    return costoMuslo + costoEmpanizadoPorPorcion;
  };

  // Calcular costo de base Papas Fritas
  const calcularCostoPapasFritas = () => {
    const { pesoPorPorcion, pesoCompra, precioCompra } = basesReceta.papasFritas;
    const costoPorGramo = precioCompra / pesoCompra;
    return costoPorGramo * pesoPorPorcion;
  };

  // Cálculos derivados de costos
  const calcularTotales = () => {
    const totalPlatos = configCostos.ventas.reduce((sum, item) => sum + item.valor, 0);
    const gastosFijos = configCostos.costosFijos.reduce((sum, item) => sum + item.valor, 0);
    const costoFijoPorPlato = totalPlatos > 0 ? gastosFijos / totalPlatos : 0;
    
    return {
      totalPlatos,
      gastosFijos,
      costoFijoPorPlato
    };
  };

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      {/* Indicador de guardado */}
      {isSaving && (
        <div className="fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
          </svg>
          Guardando...
        </div>
      )}
      
      {/* Pantalla de carga inicial */}
      {isLoading ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <svg className="animate-spin h-12 w-12 mx-auto mb-4 text-gray-600" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            <p className="text-gray-600">Cargando datos...</p>
          </div>
        </div>
      ) : (
        <>
          {currentView === 'login' && (
            <LoginScreen onLogin={handleLogin} />
          )}
          {currentView === 'brands' && (
            <BrandSelectScreen 
              brands={brands}
              onSelectBrand={handleSelectBrand}
              onAddBrand={handleAddBrand}
              onLogout={handleLogout}
              userName={currentUser?.name}
            />
          )}
          {currentView === 'dashboard' && (
            <DashboardScreen 
              brand={selectedBrand}
              onBack={handleBackToBrands}
              onLogout={handleLogout}
              userName={currentUser?.name}
              // Ingredientes globales
              ingredients={ingredients}
              onAddIngredient={handleAddIngredient}
              onDeleteIngredient={handleDeleteIngredient}
              onUpdateIngredient={handleUpdateIngredient}
              // Recetas por marca
              recetas={getRecetasForBrand()}
              onAddReceta={handleAddReceta}
              onDeleteReceta={handleDeleteReceta}
              onUpdateReceta={handleUpdateReceta}
              // Configuración de costos
              configCostos={configCostos}
              onUpdateConfigCostos={handleUpdateConfigCostos}
              deliveryPorReceta={deliveryPorReceta}
          onToggleDelivery={handleToggleDelivery}
          isvPorReceta={isvPorReceta}
          onToggleISV={handleToggleISV}
          precioVentaPorReceta={precioVentaPorReceta}
          onUpdatePrecioVenta={handleUpdatePrecioVenta}
          onUpdatePrecioCliente={handleUpdatePrecioCliente}
          calcularTotales={calcularTotales}
          // Bases de receta
          basesReceta={basesReceta}
          onUpdateBasesReceta={handleUpdateBasesReceta}
          basesPorReceta={basesPorReceta}
          onToggleBaseReceta={handleToggleBaseReceta}
          calcularCostoPolloFrito={calcularCostoPolloFrito}
          calcularCostoPolloFritoEnsalada={calcularCostoPolloFritoEnsalada}
          calcularCostoPapasFritas={calcularCostoPapasFritas}
          // Empaques/Materiales
          empaques={empaques}
          empaquesPorReceta={empaquesPorReceta}
          onToggleEmpaque={handleToggleEmpaque}
          calcularCostoEmpaques={calcularCostoEmpaques}
          onUpdateEmpaques={setEmpaques}
        />
      )}
        </>
      )}
    </div>
  );
}

// ============================================
// PANTALLA DE LOGIN
// ============================================
function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    await new Promise(resolve => setTimeout(resolve, 500));

    const user = mockDB.users.find(
      u => u.email === email && u.password === password
    );

    if (user) {
      onLogin({ email: user.email, name: user.name });
    } else {
      setError('Credenciales incorrectas');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-5 bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm p-10">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Costos</h1>
          <p className="text-sm text-gray-500">Sistema de gestión de costos</p>
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Correo electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg outline-none focus:border-gray-400 transition-colors"
              placeholder="correo@ejemplo.com"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg outline-none focus:border-gray-400 transition-colors"
              placeholder="••••••••"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSubmit();
              }}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3 px-5 text-base font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-60"
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// PANTALLA DE SELECCIÓN DE MARCA
// ============================================
function BrandSelectScreen({ brands, onSelectBrand, onAddBrand, onLogout, userName }) {
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex justify-between items-center px-6 py-4 bg-white border-b border-gray-200">
        <h1 className="text-lg font-semibold text-gray-900">Costos</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">{userName}</span>
          <button 
            onClick={onLogout} 
            className="px-3 py-2 text-sm text-gray-500 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="flex-1 p-10">
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Selecciona una marca</h2>
          <p className="text-base text-gray-500 mb-8">Elige la marca para gestionar sus costos</p>

          <div className="flex flex-col gap-3">
            {brands.map((brand) => (
              <button
                key={brand.id}
                onClick={() => onSelectBrand(brand)}
                className="flex items-center gap-4 p-5 bg-white border border-gray-200 rounded-xl text-left w-full hover:border-gray-400 transition-all hover:-translate-y-0.5"
              >
                <div 
                  className="w-12 h-12 flex items-center justify-center text-xl font-semibold rounded-lg"
                  style={{ 
                    backgroundColor: brand.color + '15',
                    color: brand.color
                  }}
                >
                  {brand.name.charAt(0)}
                </div>
                <span className="flex-1 text-base font-medium text-gray-900">{brand.name}</span>
                <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            ))}

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-4 p-5 bg-gray-50 border border-dashed border-gray-300 rounded-xl text-left w-full hover:border-gray-400 transition-colors"
            >
              <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-lg text-gray-400">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </div>
              <span className="text-base text-gray-500">Agregar marca</span>
            </button>
          </div>
        </div>
      </main>

      {showAddModal && (
        <AddBrandModal
          onClose={() => setShowAddModal(false)}
          onAdd={(brand) => {
            onAddBrand(brand);
            setShowAddModal(false);
          }}
        />
      )}
    </div>
  );
}

// ============================================
// MODAL AGREGAR MARCA
// ============================================
function AddBrandModal({ onClose, onAdd }) {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#3B82F6');

  const colors = [
    '#EF4444', '#F97316', '#F59E0B', '#22C55E', 
    '#14B8A6', '#3B82F6', '#8B5CF6', '#EC4899'
  ];

  const handleSubmit = () => {
    if (name.trim()) {
      onAdd({ name: name.trim(), color });
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-5 z-50"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md bg-white rounded-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center px-6 py-5 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Nueva marca</h3>
          <button 
            onClick={onClose} 
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Nombre de la marca</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg outline-none focus:border-gray-400 transition-colors"
              placeholder="Ej: Mi Nueva Marca"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSubmit();
              }}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Color identificador</label>
            <div className="flex gap-2.5 flex-wrap">
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="w-8 h-8 rounded-full transition-transform"
                  style={{
                    backgroundColor: c,
                    transform: color === c ? 'scale(1.2)' : 'scale(1)',
                    boxShadow: color === c ? `0 0 0 2px white, 0 0 0 4px ${c}` : 'none'
                  }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3 justify-end mt-2">
            <button 
              onClick={onClose} 
              className="px-5 py-3 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button 
              onClick={handleSubmit}
              className="px-5 py-3 text-base font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Crear marca
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// PANTALLA DASHBOARD
// ============================================
function DashboardScreen({ 
  brand, 
  onBack, 
  onLogout, 
  userName,
  // Ingredientes GLOBALES (compartidos)
  ingredients,
  onAddIngredient,
  onDeleteIngredient,
  onUpdateIngredient,
  // Recetas POR MARCA
  recetas,
  onAddReceta,
  onDeleteReceta,
  onUpdateReceta,
  // Configuración de costos
  configCostos,
  onUpdateConfigCostos,
  deliveryPorReceta,
  onToggleDelivery,
  isvPorReceta,
  onToggleISV,
  precioVentaPorReceta,
  onUpdatePrecioVenta,
  onUpdatePrecioCliente,
  calcularTotales,
  // Bases de receta
  basesReceta,
  onUpdateBasesReceta,
  basesPorReceta,
  onToggleBaseReceta,
  calcularCostoPolloFrito,
  calcularCostoPolloFritoEnsalada,
  calcularCostoPapasFritas,
  // Empaques/Materiales
  empaques,
  empaquesPorReceta,
  onToggleEmpaque,
  calcularCostoEmpaques,
  onUpdateEmpaques
}) {
  const [currentModule, setCurrentModule] = useState('menu');

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex justify-between items-center px-6 py-4 bg-white border-b border-gray-200">
        <div className="flex items-center gap-3">
          <button 
            onClick={currentModule === 'menu' ? onBack : () => setCurrentModule('menu')} 
            className="w-9 h-9 flex items-center justify-center border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <div 
            className="px-3 py-1.5 text-sm font-medium rounded-md"
            style={{ 
              backgroundColor: brand.color + '15',
              color: brand.color
            }}
          >
            {brand.name}
          </div>
          {currentModule !== 'menu' && (
            <span className="text-gray-400 mx-2">/</span>
          )}
          {currentModule === 'ingredientes' && (
            <span className="text-sm font-medium text-gray-700">Banco de Ingredientes (Compartido)</span>
          )}
          {currentModule === 'recetas' && (
            <span className="text-sm font-medium text-gray-700">Recetas</span>
          )}
          {currentModule === 'costos' && (
            <span className="text-sm font-medium text-gray-700">Configuración de Costos</span>
          )}
          {currentModule === 'bases' && (
            <span className="text-sm font-medium text-gray-700">Bases de Receta</span>
          )}
          {currentModule === 'empaques' && (
            <span className="text-sm font-medium text-gray-700">Empaques / Materiales</span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">{userName}</span>
          <button 
            onClick={onLogout} 
            className="px-3 py-2 text-sm text-gray-500 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 overflow-auto">
        {currentModule === 'menu' && (
          <DashboardMenu onSelectModule={setCurrentModule} brand={brand} recipesCount={recetas.length} />
        )}
        {currentModule === 'ingredientes' && (
          <BancoIngredientes 
            ingredients={ingredients}
            onAdd={onAddIngredient}
            onDelete={onDeleteIngredient}
            onUpdate={onUpdateIngredient}
          />
        )}
        {currentModule === 'recetas' && (
          <RecetasModule 
            recipes={recetas}
            ingredients={ingredients}
            onAdd={onAddReceta}
            onUpdate={onUpdateReceta}
            onDelete={onDeleteReceta}
            configCostos={configCostos}
            deliveryPorReceta={deliveryPorReceta}
            onToggleDelivery={onToggleDelivery}
            isvPorReceta={isvPorReceta}
            onToggleISV={onToggleISV}
            precioVentaPorReceta={precioVentaPorReceta}
            onUpdatePrecioVenta={onUpdatePrecioVenta}
            onUpdatePrecioCliente={onUpdatePrecioCliente}
            calcularTotales={calcularTotales}
            basesReceta={basesReceta}
            basesPorReceta={basesPorReceta}
            onToggleBaseReceta={onToggleBaseReceta}
            calcularCostoPolloFrito={calcularCostoPolloFrito}
            calcularCostoPolloFritoEnsalada={calcularCostoPolloFritoEnsalada}
            calcularCostoPapasFritas={calcularCostoPapasFritas}
            empaques={empaques}
            empaquesPorReceta={empaquesPorReceta}
            onToggleEmpaque={onToggleEmpaque}
            calcularCostoEmpaques={calcularCostoEmpaques}
          />
        )}
        {currentModule === 'costos' && (
          <ConfiguracionCostos
            configCostos={configCostos}
            onUpdateConfigCostos={onUpdateConfigCostos}
            calcularTotales={calcularTotales}
          />
        )}
        {currentModule === 'bases' && (
          <BasesRecetaModule
            basesReceta={basesReceta}
            onUpdateBasesReceta={onUpdateBasesReceta}
            calcularCostoPolloFrito={calcularCostoPolloFrito}
            calcularCostoPolloFritoEnsalada={calcularCostoPolloFritoEnsalada}
            calcularCostoPapasFritas={calcularCostoPapasFritas}
          />
        )}
        {currentModule === 'empaques' && (
          <EmpaquesModule
            empaques={empaques}
            onUpdateEmpaques={onUpdateEmpaques}
          />
        )}
      </main>
    </div>
  );
}

// ============================================
// MENÚ DEL DASHBOARD
// ============================================
function DashboardMenu({ onSelectModule, brand, recipesCount }) {
  const modules = [
    { id: 'recetas', name: 'Recetas y platos', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', description: `${recipesCount} receta${recipesCount !== 1 ? 's' : ''} en ${brand.name}`, badge: null, active: true },
    { id: 'ingredientes', name: 'Banco de Ingredientes', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4', description: 'Compartido entre todas las marcas', badge: 'Global', active: true },
    { id: 'bases', name: 'Bases de Receta', icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z', description: 'Pollo frito, papas y más', badge: 'Nuevo', active: true },
    { id: 'empaques', name: 'Empaques / Materiales', icon: 'M20 7l-8-4-8 4m16 0v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4M12 21l8-4V7', description: 'Gestionar empaques y materiales', badge: null, active: true },
    { id: 'costos', name: 'Configuración de Costos', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', description: 'Costos fijos, ventas y prorrateo', badge: null, active: true },
    { id: 'reportes', name: 'Reportes', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', description: 'Próximamente', badge: null, active: false },
  ];

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Dashboard de {brand.name}</h2>
      <p className="text-base text-gray-500 mb-8">Selecciona un módulo para comenzar</p>
      
      <div className="grid gap-3">
        {modules.map((module) => (
          <button
            key={module.id}
            onClick={() => module.active ? onSelectModule(module.id) : null}
            disabled={!module.active}
            className={`flex items-center gap-4 p-5 bg-white border border-gray-200 rounded-xl text-left w-full transition-all ${
              module.active 
                ? 'hover:border-gray-400 hover:-translate-y-0.5 cursor-pointer' 
                : 'opacity-50 cursor-not-allowed'
            }`}
          >
            <span className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-lg text-gray-500">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d={module.icon} />
              </svg>
            </span>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-base font-medium text-gray-900">{module.name}</span>
                {module.badge && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                    {module.badge}
                  </span>
                )}
              </div>
              <span className="block text-sm text-gray-500">{module.description}</span>
            </div>
            {module.active && (
              <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================
// CONFIGURACIÓN DE COSTOS
// ============================================
function ConfiguracionCostos({ configCostos, onUpdateConfigCostos, calcularTotales }) {
  const [editMode, setEditMode] = useState(false);
  const [tempConfig, setTempConfig] = useState(configCostos);
  const [newVentaNombre, setNewVentaNombre] = useState('');
  const [newCostoNombre, setNewCostoNombre] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  
  const totales = calcularTotales();

  const handleSave = () => {
    onUpdateConfigCostos(tempConfig);
    setEditMode(false);
  };

  const handleCancel = () => {
    setTempConfig(configCostos);
    setNewVentaNombre('');
    setNewCostoNombre('');
    setEditMode(false);
  };

  const updateVentaValor = (id, valor) => {
    setTempConfig({
      ...tempConfig,
      ventas: tempConfig.ventas.map(v => v.id === id ? { ...v, valor: parseInt(valor) || 0 } : v)
    });
  };

  const updateVentaNombre = (id, nombre) => {
    setTempConfig({
      ...tempConfig,
      ventas: tempConfig.ventas.map(v => v.id === id ? { ...v, nombre } : v)
    });
  };

  const addVenta = () => {
    if (!newVentaNombre.trim()) return;
    setTempConfig({
      ...tempConfig,
      ventas: [...tempConfig.ventas, { id: 'v' + Date.now(), nombre: newVentaNombre.trim(), valor: 0 }]
    });
    setNewVentaNombre('');
  };

  const deleteVenta = (id) => {
    setTempConfig({
      ...tempConfig,
      ventas: tempConfig.ventas.filter(v => v.id !== id)
    });
  };

  const updateCostoValor = (id, valor) => {
    setTempConfig({
      ...tempConfig,
      costosFijos: tempConfig.costosFijos.map(c => c.id === id ? { ...c, valor: parseFloat(valor) || 0 } : c)
    });
  };

  const updateCostoNombre = (id, nombre) => {
    setTempConfig({
      ...tempConfig,
      costosFijos: tempConfig.costosFijos.map(c => c.id === id ? { ...c, nombre } : c)
    });
  };

  const addCosto = () => {
    if (!newCostoNombre.trim()) return;
    setTempConfig({
      ...tempConfig,
      costosFijos: [...tempConfig.costosFijos, { id: 'c' + Date.now(), nombre: newCostoNombre.trim(), valor: 0 }]
    });
    setNewCostoNombre('');
  };

  const deleteCosto = (id) => {
    setTempConfig({
      ...tempConfig,
      costosFijos: tempConfig.costosFijos.filter(c => c.id !== id)
    });
  };

  const config = editMode ? tempConfig : configCostos;
  const totalPlatosTemp = config.ventas.reduce((sum, v) => sum + v.valor, 0);
  const gastosFijosTemp = config.costosFijos.reduce((sum, c) => sum + c.valor, 0);
  const costoFijoPorPlatoTemp = totalPlatosTemp > 0 ? gastosFijosTemp / totalPlatosTemp : 0;

  // Componente reutilizable para cada fila de item
  const ItemRow = ({ item, onUpdateNombre, onUpdateValor, onDelete, prefix = '', placeholder = 'Nombre' }) => (
    <div className="flex items-center gap-3 py-2">
      {editMode ? (
        <>
          <input
            type="text"
            value={item.nombre}
            onChange={(e) => onUpdateNombre(item.id, e.target.value)}
            className="flex-1 h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400 bg-white"
            placeholder={placeholder}
          />
          <div className="w-32 flex items-center">
            {prefix && <span className="text-sm text-gray-400 mr-1">{prefix}</span>}
            <input
              type="number"
              value={item.valor}
              onChange={(e) => onUpdateValor(item.id, e.target.value)}
              className="flex-1 h-10 px-3 border border-gray-200 rounded-lg text-sm text-right focus:outline-none focus:border-gray-400 bg-white"
            />
          </div>
          <button
            onClick={onDelete}
            className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </>
      ) : (
        <>
          <span className="flex-1 text-sm text-gray-700">{item.nombre}</span>
          <span className="text-sm font-medium text-gray-900 tabular-nums">{prefix}{item.valor.toLocaleString()}</span>
        </>
      )}
    </div>
  );

  // Componente para agregar nuevo item
  const AddItemRow = ({ value, onChange, onAdd, placeholder }) => (
    <div className="flex items-center gap-3 py-2 mt-2 pt-4 border-t border-gray-100">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && onAdd()}
        className="flex-1 h-10 px-3 border border-dashed border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-400 bg-gray-50"
        placeholder={placeholder}
      />
      <button
        onClick={onAdd}
        disabled={!value.trim()}
        className="h-10 px-4 flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 5v14M5 12h14" />
        </svg>
        Agregar
      </button>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Configuración de Costos</h2>
          <p className="text-sm text-gray-500 mt-1">Variables base para el cálculo de costos por plato</p>
        </div>
        {!editMode ? (
          <button
            onClick={() => setEditMode(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Editar valores
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              className="px-4 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Guardar cambios
            </button>
          </div>
        )}
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Total platos/mes</p>
          <p className="text-2xl font-semibold text-gray-700 tabular-nums">{totalPlatosTemp.toLocaleString()}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Gastos fijos totales</p>
          <p className="text-2xl font-semibold text-gray-700 tabular-nums">L{gastosFijosTemp.toLocaleString()}</p>
        </div>
        <div className="bg-gray-900 rounded-xl p-5">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Costo fijo por plato</p>
          <p className="text-3xl font-bold text-white tabular-nums">L{costoFijoPorPlatoTemp.toFixed(2)}</p>
        </div>
      </div>

      {/* Secciones de Ventas y Costos - Layout Vertical */}
      <div className="space-y-6 mb-6">
        {/* Ventas promedio mensuales */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">Ventas promedio mensuales</h3>
          </div>
          
          {/* Header de columnas (solo en modo edición) */}
          {editMode && (
            <div className="flex items-center gap-3 px-5 py-2 bg-gray-50 border-b border-gray-100">
              <span className="flex-1 text-xs font-medium text-gray-500 uppercase">Categoría</span>
              <span className="w-32 text-xs font-medium text-gray-500 uppercase text-right">Cantidad</span>
              <span className="w-10"></span>
            </div>
          )}
          
          <div className="px-5 py-2">
            {config.ventas.map(item => (
              <ItemRow
                key={item.id}
                item={item}
                onUpdateNombre={updateVentaNombre}
                onUpdateValor={updateVentaValor}
                onDelete={() => setDeleteConfirm({ type: 'venta', item })}
                placeholder="Nombre de categoría"
              />
            ))}
            
            {editMode && (
              <AddItemRow
                value={newVentaNombre}
                onChange={setNewVentaNombre}
                onAdd={addVenta}
                placeholder="Nueva categoría de venta..."
              />
            )}
          </div>
          
          {/* Total */}
          <div className="flex items-center justify-between px-5 py-4 bg-gray-50 border-t border-gray-100">
            <span className="text-sm font-medium text-gray-700">Total</span>
            <span className="text-sm font-bold text-gray-900 tabular-nums">{totalPlatosTemp.toLocaleString()} platos</span>
          </div>
        </div>

        {/* Costos fijos mensuales */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">Costos fijos mensuales</h3>
          </div>
          
          {/* Header de columnas (solo en modo edición) */}
          {editMode && (
            <div className="flex items-center gap-3 px-5 py-2 bg-gray-50 border-b border-gray-100">
              <span className="flex-1 text-xs font-medium text-gray-500 uppercase">Concepto</span>
              <span className="w-32 text-xs font-medium text-gray-500 uppercase text-right">Monto (L)</span>
              <span className="w-10"></span>
            </div>
          )}
          
          <div className="px-5 py-2">
            {config.costosFijos.map(item => (
              <ItemRow
                key={item.id}
                item={item}
                onUpdateNombre={updateCostoNombre}
                onUpdateValor={updateCostoValor}
                onDelete={() => setDeleteConfirm({ type: 'costo', item })}
                prefix="L"
                placeholder="Nombre del gasto"
              />
            ))}
            
            {editMode && (
              <AddItemRow
                value={newCostoNombre}
                onChange={setNewCostoNombre}
                onAdd={addCosto}
                placeholder="Nuevo costo fijo..."
              />
            )}
          </div>
          
          {/* Total */}
          <div className="flex items-center justify-between px-5 py-4 bg-gray-50 border-t border-gray-100">
            <span className="text-sm font-medium text-gray-700">Total</span>
            <span className="text-sm font-bold text-gray-900 tabular-nums">L{gastosFijosTemp.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Configuraciones adicionales */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Porcentaje de delivery */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Configuración de Delivery</h3>
          <p className="text-xs text-gray-500 mb-4">Se suma al precio cliente final cuando el plato tiene delivery activo</p>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Porcentaje adicional</span>
            {editMode ? (
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={config.porcentajeDelivery}
                  onChange={(e) => setTempConfig({ ...tempConfig, porcentajeDelivery: parseFloat(e.target.value) || 0 })}
                  className="w-20 h-10 px-3 border border-gray-200 rounded-lg text-sm text-right focus:outline-none focus:border-gray-400"
                />
                <span className="text-sm text-gray-500">%</span>
              </div>
            ) : (
              <span className="text-lg font-semibold text-gray-900">{config.porcentajeDelivery}%</span>
            )}
          </div>
        </div>

        {/* Porcentaje de ISV */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Impuesto Sobre Ventas (ISV)</h3>
          <p className="text-xs text-gray-500 mb-4">Se calcula sobre el precio de venta, no sobre el costo</p>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Porcentaje de ISV</span>
            {editMode ? (
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={config.porcentajeISV}
                  onChange={(e) => setTempConfig({ ...tempConfig, porcentajeISV: parseFloat(e.target.value) || 0 })}
                  className="w-20 h-10 px-3 border border-gray-200 rounded-lg text-sm text-right focus:outline-none focus:border-gray-400"
                />
                <span className="text-sm text-gray-500">%</span>
              </div>
            ) : (
              <span className="text-lg font-semibold text-gray-900">{config.porcentajeISV}%</span>
            )}
          </div>
        </div>
      </div>

      {/* Nota sobre ISV */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl mb-6">
        <p className="text-sm text-amber-800">
          <span className="font-semibold">Importante:</span> El ISV NO es un costo operativo. No afecta el margen ni el food cost. Solo se calcula sobre el precio de venta y se puede activar/desactivar por plato.
        </p>
      </div>

      {/* Fórmulas explicativas */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Fórmulas aplicadas</h3>
        <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
          <div>
            <span className="text-gray-500">Costo Directo:</span>
            <span className="text-gray-700 ml-2">Ingredientes + Bases</span>
          </div>
          <div>
            <span className="text-gray-500">Costo Total:</span>
            <span className="text-gray-700 ml-2">Costo Directo + Empaques</span>
          </div>
          <div>
            <span className="text-gray-500">Costo fijo por plato:</span>
            <span className="text-gray-700 ml-2">Gastos fijos ÷ Total platos = <span className="font-semibold">L{costoFijoPorPlatoTemp.toFixed(2)}</span></span>
          </div>
          <div>
            <span className="text-gray-500">Food Cost:</span>
            <span className="text-gray-700 ml-2">(Costo Directo ÷ Precio venta) × 100</span>
          </div>
          <div>
            <span className="text-gray-500">PVP:</span>
            <span className="text-gray-700 ml-2">(Precio venta + ISV) + Delivery {config.porcentajeDelivery}% <span className="text-gray-400">(si aplica)</span></span>
          </div>
          <div>
            <span className="text-gray-500">Margen Real:</span>
            <span className="text-gray-700 ml-2">Precio venta - Costo Total - Costo fijo</span>
          </div>
        </div>
      </div>

      {/* Modal de confirmación para eliminar */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-5 z-50" onClick={() => setDeleteConfirm(null)}>
          <div className="w-full max-w-sm bg-white rounded-xl p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Eliminar {deleteConfirm.type === 'venta' ? 'categoría de venta' : 'costo fijo'}
            </h3>
            <p className="text-gray-600 mb-6">
              ¿Estás seguro que quieres eliminar <strong>"{deleteConfirm.item.nombre}"</strong>?
            </p>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setDeleteConfirm(null)} 
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                No
              </button>
              <button 
                onClick={() => { 
                  if (deleteConfirm.type === 'venta') {
                    deleteVenta(deleteConfirm.item.id);
                  } else {
                    deleteCosto(deleteConfirm.item.id);
                  }
                  setDeleteConfirm(null); 
                }} 
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
              >
                Sí
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// BASES DE RECETA
// ============================================
function BasesRecetaModule({ basesReceta, onUpdateBasesReceta, calcularCostoPolloFrito, calcularCostoPolloFritoEnsalada, calcularCostoPapasFritas }) {
  const [editMode, setEditMode] = useState(false);
  const [tempBases, setTempBases] = useState(basesReceta);
  const [expandedBase, setExpandedBase] = useState(null); // null, 'pollo', 'polloEnsalada', 'papas'

  const toggleBase = (base) => {
    setExpandedBase(expandedBase === base ? null : base);
  };

  const handleSave = () => {
    onUpdateBasesReceta(tempBases);
    setEditMode(false);
  };

  const handleCancel = () => {
    setTempBases(basesReceta);
    setEditMode(false);
  };

  const bases = editMode ? tempBases : basesReceta;
  const costoPolloFrito = calcularCostoPolloFrito();
  const costoPolloFritoEnsalada = calcularCostoPolloFritoEnsalada();
  const costoPapasFritas = calcularCostoPapasFritas();

  // Actualizar muslo de pollo
  const updateMuslo = (field, value) => {
    setTempBases({
      ...tempBases,
      polloFrito: {
        ...tempBases.polloFrito,
        muslo: {
          ...tempBases.polloFrito.muslo,
          [field]: parseFloat(value) || 0
        }
      }
    });
  };

  // Actualizar ingrediente del empanizado
  const updateEmpanizadoIngrediente = (ingId, field, value) => {
    setTempBases({
      ...tempBases,
      polloFrito: {
        ...tempBases.polloFrito,
        empanizado: {
          ...tempBases.polloFrito.empanizado,
          ingredientes: tempBases.polloFrito.empanizado.ingredientes.map(ing =>
            ing.id === ingId ? { ...ing, [field]: parseFloat(value) || 0 } : ing
          )
        }
      }
    });
  };

  // Actualizar porciones del empanizado
  const updateEmpanizadoPorciones = (value) => {
    setTempBases({
      ...tempBases,
      polloFrito: {
        ...tempBases.polloFrito,
        empanizado: {
          ...tempBases.polloFrito.empanizado,
          porciones: parseInt(value) || 1
        }
      }
    });
  };

  // Actualizar papas fritas
  const updatePapas = (field, value) => {
    setTempBases({
      ...tempBases,
      papasFritas: {
        ...tempBases.papasFritas,
        [field]: parseFloat(value) || 0
      }
    });
  };

  // Calcular costo del empanizado por porción para mostrar
  const calcularCostoEmpanizadoPorcion = () => {
    const { empanizado } = bases.polloFrito;
    const costoTotal = empanizado.ingredientes.reduce((sum, ing) => {
      return sum + (ing.pesoUsado / ing.pesoCompra) * ing.precioCompra;
    }, 0);
    return costoTotal / empanizado.porciones;
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Bases de Receta</h2>
          <p className="text-sm text-gray-500 mt-1">Componentes base reutilizables para tus recetas</p>
        </div>
        {!editMode ? (
          <button
            onClick={() => setEditMode(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Editar valores
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              className="px-4 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Guardar cambios
            </button>
          </div>
        )}
      </div>

      {/* BASE: Pollo Frito */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-6">
        <button 
          onClick={() => toggleBase('pollo')}
          className="w-full px-5 py-4 bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg 
                className={`w-5 h-5 text-gray-500 transition-transform ${expandedBase === 'pollo' ? 'rotate-90' : ''}`} 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
              <h3 className="text-base font-semibold text-gray-900">Base: Pollo Frito</h3>
            </div>
            <span className="text-sm font-bold text-gray-700">L{costoPolloFrito.toFixed(2)} / porción</span>
          </div>
        </button>

        {expandedBase === 'pollo' && (
          <>
            {/* Muslo de pollo */}
            <div className="p-5 border-b border-gray-100">
          <h4 className="text-sm font-semibold text-gray-700 mb-4">Muslo de Pollo</h4>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Peso limpio (g)</label>
              {editMode ? (
                <input
                  type="number"
                  value={bases.polloFrito.muslo.pesoLimpio}
                  onChange={(e) => updateMuslo('pesoLimpio', e.target.value)}
                  className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400"
                />
              ) : (
                <p className="text-sm font-medium text-gray-900">{bases.polloFrito.muslo.pesoLimpio}g</p>
              )}
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Peso compra (g)</label>
              {editMode ? (
                <input
                  type="number"
                  value={bases.polloFrito.muslo.pesoCompra}
                  onChange={(e) => updateMuslo('pesoCompra', e.target.value)}
                  className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400"
                />
              ) : (
                <p className="text-sm font-medium text-gray-900">{bases.polloFrito.muslo.pesoCompra}g</p>
              )}
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Precio (L)</label>
              {editMode ? (
                <input
                  type="number"
                  step="0.01"
                  value={bases.polloFrito.muslo.precioCompra}
                  onChange={(e) => updateMuslo('precioCompra', e.target.value)}
                  className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400"
                />
              ) : (
                <p className="text-sm font-medium text-gray-900">L{bases.polloFrito.muslo.precioCompra.toFixed(2)}</p>
              )}
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Merma (%)</label>
              {editMode ? (
                <input
                  type="number"
                  step="0.1"
                  value={bases.polloFrito.muslo.merma}
                  onChange={(e) => updateMuslo('merma', e.target.value)}
                  className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400"
                />
              ) : (
                <p className="text-sm font-medium text-gray-900">{bases.polloFrito.muslo.merma}%</p>
              )}
            </div>
          </div>
          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Costo del muslo:</span> L{((bases.polloFrito.muslo.pesoLimpio / bases.polloFrito.muslo.pesoCompra) * bases.polloFrito.muslo.precioCompra).toFixed(2)}
              <span className="text-xs text-gray-400 ml-2">({bases.polloFrito.muslo.pesoLimpio}g de {bases.polloFrito.muslo.pesoCompra}g a L{bases.polloFrito.muslo.precioCompra})</span>
            </p>
          </div>
        </div>

        {/* Empanizado */}
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-gray-700">Empanizado</h4>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Rinde para:</span>
              {editMode ? (
                <input
                  type="number"
                  value={bases.polloFrito.empanizado.porciones}
                  onChange={(e) => updateEmpanizadoPorciones(e.target.value)}
                  className="w-16 h-8 px-2 border border-gray-200 rounded text-sm text-center focus:outline-none focus:border-gray-400"
                />
              ) : (
                <span className="text-sm font-medium text-gray-900">{bases.polloFrito.empanizado.porciones}</span>
              )}
              <span className="text-xs text-gray-500">porciones</span>
            </div>
          </div>

          {/* Header de tabla */}
          <div className="grid grid-cols-4 gap-3 px-3 py-2 bg-gray-50 rounded-t-lg text-xs font-medium text-gray-500 uppercase">
            <span>Ingrediente</span>
            <span className="text-right">Peso usado (g)</span>
            <span className="text-right">Peso compra (g)</span>
            <span className="text-right">Precio (L)</span>
          </div>

          {/* Ingredientes del empanizado */}
          <div className="divide-y divide-gray-100 border border-gray-200 rounded-b-lg">
            {bases.polloFrito.empanizado.ingredientes.map((ing) => (
              <div key={ing.id} className="grid grid-cols-4 gap-3 px-3 py-2 items-center">
                <span className="text-sm text-gray-700">{ing.nombre}</span>
                {editMode ? (
                  <>
                    <input
                      type="number"
                      step="0.01"
                      value={ing.pesoUsado}
                      onChange={(e) => updateEmpanizadoIngrediente(ing.id, 'pesoUsado', e.target.value)}
                      className="h-8 px-2 border border-gray-200 rounded text-sm text-right focus:outline-none focus:border-gray-400"
                    />
                    <input
                      type="number"
                      step="0.01"
                      value={ing.pesoCompra}
                      onChange={(e) => updateEmpanizadoIngrediente(ing.id, 'pesoCompra', e.target.value)}
                      className="h-8 px-2 border border-gray-200 rounded text-sm text-right focus:outline-none focus:border-gray-400"
                    />
                    <input
                      type="number"
                      step="0.01"
                      value={ing.precioCompra}
                      onChange={(e) => updateEmpanizadoIngrediente(ing.id, 'precioCompra', e.target.value)}
                      className="h-8 px-2 border border-gray-200 rounded text-sm text-right focus:outline-none focus:border-gray-400"
                    />
                  </>
                ) : (
                  <>
                    <span className="text-sm text-gray-900 text-right tabular-nums">{ing.pesoUsado}</span>
                    <span className="text-sm text-gray-900 text-right tabular-nums">{ing.pesoCompra}</span>
                    <span className="text-sm text-gray-900 text-right tabular-nums">L{ing.precioCompra.toFixed(2)}</span>
                  </>
                )}
              </div>
            ))}
          </div>

          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Costo empanizado por porción:</span> L{calcularCostoEmpanizadoPorcion().toFixed(2)}
            </p>
          </div>
        </div>
          </>
        )}
      </div>

      {/* BASE: Pollo Frito Ensalada y Sandwich */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-6">
        <button 
          onClick={() => toggleBase('polloEnsalada')}
          className="w-full px-5 py-4 bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg 
                className={`w-5 h-5 text-gray-500 transition-transform ${expandedBase === 'polloEnsalada' ? 'rotate-90' : ''}`} 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
              <h3 className="text-base font-semibold text-gray-900">Base: Pollo Frito Ensalada y Sandwich</h3>
            </div>
            <span className="text-sm font-bold text-gray-700">L{costoPolloFritoEnsalada.toFixed(2)} / porción</span>
          </div>
        </button>

        {expandedBase === 'polloEnsalada' && (
          <>
            {/* Muslo de pollo */}
            <div className="p-5 border-b border-gray-100">
              <h4 className="text-sm font-semibold text-gray-700 mb-4">Muslo de Pollo</h4>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Peso limpio (g)</label>
                  <p className="text-sm font-medium text-gray-900">{bases.polloFritoEnsalada.muslo.pesoLimpio}g</p>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Peso compra (g)</label>
                  <p className="text-sm font-medium text-gray-900">{bases.polloFritoEnsalada.muslo.pesoCompra}g</p>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Precio (L)</label>
                  <p className="text-sm font-medium text-gray-900">L{bases.polloFritoEnsalada.muslo.precioCompra.toFixed(2)}</p>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Merma (%)</label>
                  <p className="text-sm font-medium text-gray-900">{bases.polloFritoEnsalada.muslo.merma}%</p>
                </div>
              </div>
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Costo del muslo:</span> L{((bases.polloFritoEnsalada.muslo.pesoLimpio / bases.polloFritoEnsalada.muslo.pesoCompra) * bases.polloFritoEnsalada.muslo.precioCompra).toFixed(2)}
                  <span className="text-xs text-gray-400 ml-2">({bases.polloFritoEnsalada.muslo.pesoLimpio}g de {bases.polloFritoEnsalada.muslo.pesoCompra}g a L{bases.polloFritoEnsalada.muslo.precioCompra})</span>
                </p>
              </div>
            </div>

            {/* Empanizado */}
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-semibold text-gray-700">Empanizado</h4>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Rinde para:</span>
                  <span className="text-sm font-medium text-gray-900">{bases.polloFritoEnsalada.empanizado.porciones}</span>
                  <span className="text-xs text-gray-500">porciones</span>
                </div>
              </div>

              {/* Header de tabla */}
              <div className="grid grid-cols-4 gap-3 px-3 py-2 bg-gray-50 rounded-t-lg text-xs font-medium text-gray-500 uppercase">
                <span>Ingrediente</span>
                <span className="text-right">Peso usado (g)</span>
                <span className="text-right">Peso compra (g)</span>
                <span className="text-right">Precio (L)</span>
              </div>

              {/* Ingredientes del empanizado */}
              <div className="divide-y divide-gray-100 border border-gray-200 rounded-b-lg">
                {bases.polloFritoEnsalada.empanizado.ingredientes.map((ing) => (
                  <div key={ing.id} className="grid grid-cols-4 gap-3 px-3 py-2 items-center">
                    <span className="text-sm text-gray-700">{ing.nombre}</span>
                    <span className="text-sm text-gray-900 text-right tabular-nums">{ing.pesoUsado}</span>
                    <span className="text-sm text-gray-900 text-right tabular-nums">{ing.pesoCompra}</span>
                    <span className="text-sm text-gray-900 text-right tabular-nums">L{ing.precioCompra.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Costo empanizado por porción:</span> L{(() => {
                    const emp = bases.polloFritoEnsalada.empanizado;
                    const costoTotal = emp.ingredientes.reduce((sum, ing) => sum + (ing.pesoUsado / ing.pesoCompra) * ing.precioCompra, 0);
                    return (costoTotal / emp.porciones).toFixed(2);
                  })()}
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* BASE: Papas Fritas */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-6">
        <button 
          onClick={() => toggleBase('papas')}
          className="w-full px-5 py-4 bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg 
                className={`w-5 h-5 text-gray-500 transition-transform ${expandedBase === 'papas' ? 'rotate-90' : ''}`} 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
              <h3 className="text-base font-semibold text-gray-900">Base: Papas Fritas</h3>
            </div>
            <span className="text-sm font-bold text-gray-700">L{costoPapasFritas.toFixed(2)} / porción</span>
          </div>
        </button>

        {expandedBase === 'papas' && (
          <div className="p-5">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Peso por porción (g)</label>
              {editMode ? (
                <input
                  type="number"
                  value={bases.papasFritas.pesoPorPorcion}
                  onChange={(e) => updatePapas('pesoPorPorcion', e.target.value)}
                  className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400"
                />
              ) : (
                <p className="text-sm font-medium text-gray-900">{bases.papasFritas.pesoPorPorcion}g</p>
              )}
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Peso compra (g)</label>
              {editMode ? (
                <input
                  type="number"
                  value={bases.papasFritas.pesoCompra}
                  onChange={(e) => updatePapas('pesoCompra', e.target.value)}
                  className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400"
                />
              ) : (
                <p className="text-sm font-medium text-gray-900">{bases.papasFritas.pesoCompra.toLocaleString()}g <span className="text-gray-400 text-xs">(30 lb)</span></p>
              )}
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Precio compra (L)</label>
              {editMode ? (
                <input
                  type="number"
                  step="0.01"
                  value={bases.papasFritas.precioCompra}
                  onChange={(e) => updatePapas('precioCompra', e.target.value)}
                  className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400"
                />
              ) : (
                <p className="text-sm font-medium text-gray-900">L{bases.papasFritas.precioCompra.toFixed(2)}</p>
              )}
            </div>
          </div>

          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Costo por gramo:</span> L{(bases.papasFritas.precioCompra / bases.papasFritas.pesoCompra).toFixed(4)}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              <span className="font-medium">Costo por porción ({bases.papasFritas.pesoPorPorcion}g):</span> L{costoPapasFritas.toFixed(2)}
            </p>
          </div>
        </div>
        )}
      </div>

      {/* Nota informativa */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <p className="text-sm text-blue-800">
          <span className="font-semibold">¿Cómo usar las bases?</span> Al crear o editar una receta, podrás activar estas bases con un checkbox. 
          El costo de las bases activadas se sumará automáticamente al costo directo del plato.
        </p>
      </div>
    </div>
  );
}

// ============================================
// EMPAQUES / MATERIALES
// ============================================
function EmpaquesModule({ empaques, onUpdateEmpaques }) {
  const [editingEmpaque, setEditingEmpaque] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [newEmpaque, setNewEmpaque] = useState({ nombre: '', precio: '' });

  // Agregar nuevo empaque
  const handleAddEmpaque = () => {
    if (newEmpaque.nombre.trim() && newEmpaque.precio !== '') {
      const nuevoEmpaque = {
        id: 'emp_' + Date.now(),
        nombre: newEmpaque.nombre.trim(),
        precio: parseFloat(newEmpaque.precio) || 0
      };
      onUpdateEmpaques([...empaques, nuevoEmpaque]);
      setNewEmpaque({ nombre: '', precio: '' });
      setShowAddModal(false);
    }
  };

  // Actualizar empaque existente
  const handleUpdateEmpaque = () => {
    if (editingEmpaque && editingEmpaque.nombre.trim()) {
      const updated = empaques.map(emp => 
        emp.id === editingEmpaque.id 
          ? { ...emp, nombre: editingEmpaque.nombre.trim(), precio: parseFloat(editingEmpaque.precio) || 0 }
          : emp
      );
      onUpdateEmpaques(updated);
      setEditingEmpaque(null);
    }
  };

  // Eliminar empaque
  const handleDeleteEmpaque = (id) => {
    onUpdateEmpaques(empaques.filter(emp => emp.id !== id));
    setDeleteConfirm(null);
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Empaques / Materiales</h2>
          <p className="text-sm text-gray-500 mt-1">Gestiona los empaques y materiales disponibles para las recetas</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 4v16m8-8H4" />
          </svg>
          Agregar empaque
        </button>
      </div>

      {/* Lista de empaques */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">Lista de empaques</h3>
        </div>
        
        <div className="divide-y divide-gray-100">
          {empaques.map((empaque) => (
            <div key={empaque.id} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{empaque.nombre}</p>
                <p className="text-xs text-gray-500">ID: {empaque.id}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-gray-900 tabular-nums">L{empaque.precio.toFixed(2)}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingEmpaque({ ...empaque })}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(empaque)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Eliminar"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {empaques.length === 0 && (
          <div className="px-5 py-12 text-center">
            <p className="text-gray-500">No hay empaques configurados</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-3 text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              Agregar el primero
            </button>
          </div>
        )}
      </div>

      {/* Nota informativa */}
      <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-xl">
        <p className="text-sm text-purple-800">
          <span className="font-semibold">Nota:</span> Los empaques se pueden activar/desactivar individualmente en cada receta. El costo de empaques activos se suma al costo total del plato.
        </p>
      </div>

      {/* Modal para agregar empaque */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-5 z-50" onClick={() => setShowAddModal(false)}>
          <div className="w-full max-w-md bg-white rounded-xl p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Agregar empaque</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input
                  type="text"
                  value={newEmpaque.nombre}
                  onChange={(e) => setNewEmpaque({ ...newEmpaque, nombre: e.target.value })}
                  placeholder="Ej: Caja para llevar"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Precio (L)</label>
                <input
                  type="number"
                  step="0.01"
                  value={newEmpaque.precio}
                  onChange={(e) => setNewEmpaque({ ...newEmpaque, precio: e.target.value })}
                  placeholder="0.00"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => { setShowAddModal(false); setNewEmpaque({ nombre: '', precio: '' }); }}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddEmpaque}
                disabled={!newEmpaque.nombre.trim() || newEmpaque.precio === ''}
                className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Agregar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para editar empaque */}
      {editingEmpaque && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-5 z-50" onClick={() => setEditingEmpaque(null)}>
          <div className="w-full max-w-md bg-white rounded-xl p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Editar empaque</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input
                  type="text"
                  value={editingEmpaque.nombre}
                  onChange={(e) => setEditingEmpaque({ ...editingEmpaque, nombre: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Precio (L)</label>
                <input
                  type="number"
                  step="0.01"
                  value={editingEmpaque.precio}
                  onChange={(e) => setEditingEmpaque({ ...editingEmpaque, precio: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => setEditingEmpaque(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdateEmpaque}
                disabled={!editingEmpaque.nombre.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación para eliminar */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-5 z-50" onClick={() => setDeleteConfirm(null)}>
          <div className="w-full max-w-sm bg-white rounded-xl p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Eliminar empaque</h3>
            <p className="text-gray-600 mb-6">
              ¿Estás seguro que quieres eliminar <strong>"{deleteConfirm.nombre}"</strong>?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                No
              </button>
              <button
                onClick={() => handleDeleteEmpaque(deleteConfirm.id)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// BANCO DE INGREDIENTES
// ============================================
function BancoIngredientes({ ingredients, onAdd, onDelete, onUpdate }) {
  // ========== ESTADOS LOCALES ==========
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrupo, setFilterGrupo] = useState('');
  const [filterPendientes, setFilterPendientes] = useState(false);

  // ========== DATOS DERIVADOS ==========
  const grupos = [...new Set(ingredients.map(ing => ing.grupo))].filter(Boolean).sort();
  const pendientesCount = ingredients.filter(ing => !ing.pesoCompra || !ing.precio).length;

  // ========== FILTRADO ==========
  // Filtrar por nombre (igual que en recetas)
  const filteredIngredients = ingredients.filter(ing =>
    ing.ingrediente.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Aplicar filtros adicionales
  const calcularListaFiltrada = () => {
    let resultado = filteredIngredients.slice();

    // Filtro por grupo
    if (filterGrupo !== '') {
      resultado = resultado.filter((ing) => ing.grupo === filterGrupo);
    }

    // Filtro por pendientes
    if (filterPendientes === true) {
      resultado = resultado.filter((ing) => !ing.pesoCompra || !ing.precio);
    }

    return resultado;
  };

  const listaFiltrada = calcularListaFiltrada();

  // ========== HANDLERS ==========
  const handleDelete = (id) => {
    onDelete(id);
    setDeleteConfirm(null);
  };

  // ========== RENDER ==========
  return (
    <div className="max-w-7xl mx-auto">
      {/* Header con filtros */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <select
          value={filterGrupo}
          onChange={(e) => setFilterGrupo(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400 bg-white"
        >
          <option value="">Todos los grupos</option>
          {grupos.map(grupo => (
            <option key={grupo} value={grupo}>{grupo}</option>
          ))}
        </select>
        {pendientesCount > 0 && (
          <button
            type="button"
            onClick={() => setFilterPendientes(!filterPendientes)}
            className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg text-sm font-medium transition-colors ${
              filterPendientes 
                ? 'bg-red-50 border-red-200 text-red-700' 
                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Pendientes ({pendientesCount})
          </button>
        )}
        <div className="flex-1"></div>
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Agregar ingrediente
        </button>
      </div>

      {/* Barra de búsqueda */}
      <div className="mb-4 relative">
        <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Buscar ingrediente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400"
        />
      </div>

      {/* Contador */}
      <p className="text-sm text-gray-500 mb-4">
        {listaFiltrada.length} de {ingredients.length} ingredientes
        {filterPendientes && ' (mostrando solo pendientes)'}
        {pendientesCount > 0 && !filterPendientes && (
          <span className="text-red-500 ml-2">• {pendientesCount} pendientes</span>
        )}
      </p>

      {/* Tabla */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-medium text-gray-700">Medida</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Ingrediente</th>
                <th className="text-right px-4 py-3 font-medium text-gray-700">Peso compra</th>
                <th className="text-right px-4 py-3 font-medium text-gray-700">Precio</th>
                <th className="text-right px-4 py-3 font-medium text-gray-700">Merma</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Grupo</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Proveedor</th>
                <th className="text-center px-4 py-3 font-medium text-gray-700 w-24">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {listaFiltrada.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    {searchTerm ? 'No se encontraron ingredientes' : 'No hay ingredientes'}
                  </td>
                </tr>
              )}
              {listaFiltrada.length > 0 && listaFiltrada.map((ing) => {
                const hasPendingFields = !ing.pesoCompra || !ing.precio;
                const isPendienteValidacion = ing.pendienteValidacion === true;
                return (
                  <tr 
                    key={ing.id} 
                    className={`hover:bg-gray-50 transition-colors ${isPendienteValidacion ? 'bg-yellow-50/50' : hasPendingFields ? 'bg-red-50/30' : ''}`}
                  >
                    <td className="px-4 py-3 text-gray-600">{ing.medida}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {ing.ingrediente}
                      {isPendienteValidacion && (
                        <span className="ml-2 inline-block px-1.5 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs font-medium">
                          Por validar
                        </span>
                      )}
                      {hasPendingFields && !isPendienteValidacion && (
                        <span className="ml-2 inline-block px-1.5 py-0.5 bg-red-100 text-red-600 rounded text-xs font-medium">
                          Pendiente
                        </span>
                      )}
                    </td>
                    <td className={`px-4 py-3 text-right ${!ing.pesoCompra ? 'text-red-500 font-medium' : 'text-gray-600'}`}>
                      {ing.pesoCompra || 'Sin datos'}
                    </td>
                    <td className={`px-4 py-3 text-right ${!ing.precio ? 'text-red-500 font-medium' : 'text-gray-900'}`}>
                      {ing.precio ? `L${ing.precio.toFixed(2)}` : 'Sin datos'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {ing.merma > 0 ? (
                        <span className="inline-block px-2 py-1 bg-amber-50 text-amber-700 rounded text-xs font-medium">
                          {ing.merma}%
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">0%</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {ing.grupo ? (
                        <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          {ing.grupo}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{ing.proveedor || '-'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => setEditingIngredient(ing)}
                          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                          title="Editar"
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirm(ing)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Eliminar"
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal agregar ingrediente */}
      {showAddModal && (
        <IngredientModal
          ingredients={ingredients}
          onClose={() => setShowAddModal(false)}
          onSave={(ingredient) => {
            onAdd(ingredient);
            setShowAddModal(false);
          }}
        />
      )}

      {/* Modal editar ingrediente */}
      {editingIngredient && (
        <IngredientModal
          ingredient={editingIngredient}
          ingredients={ingredients}
          onClose={() => setEditingIngredient(null)}
          onSave={(ingredient) => {
            onUpdate(ingredient);
            setEditingIngredient(null);
          }}
        />
      )}

      {/* Modal confirmar eliminación */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-5 z-50" onClick={() => setDeleteConfirm(null)}>
          <div className="w-full max-w-sm bg-white rounded-xl p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Eliminar ingrediente</h3>
            <p className="text-gray-600 mb-6">
              ¿Estás seguro que quieres eliminar <strong>"{deleteConfirm.ingrediente}"</strong>?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                No
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirm.id)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
              >
                Sí
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// MODAL INGREDIENTE (Agregar/Editar)
// ============================================
function IngredientModal({ ingredient, ingredients, onClose, onSave }) {
  const isEditing = !!ingredient;
  
  const [formData, setFormData] = useState({
    medida: ingredient?.medida || 'gr',
    ingrediente: ingredient?.ingrediente || '',
    pesoCompra: ingredient?.pesoCompra || '',
    precio: ingredient?.precio || '',
    grupo: ingredient?.grupo || '',
    marca: ingredient?.marca || '',
    proveedor: ingredient?.proveedor || '',
    merma: ingredient?.merma || 0,
  });
  const [error, setError] = useState('');

  const grupos = [
    'Harinas y derivados',
    'Polvos y sazonadores',
    'Salsas y derivados',
    'Proteinas',
    'Frutas y verduras',
    'Lacteos y derivados',
    'Alcohol',
    'Otros'
  ];

  const handleSubmit = () => {
    // Validar nombre siempre obligatorio
    if (!formData.ingrediente.trim()) {
      setError('El nombre del ingrediente es obligatorio');
      return;
    }

    // Validar campos obligatorios solo para nuevos ingredientes
    if (!isEditing) {
      if (!formData.pesoCompra || formData.pesoCompra <= 0) {
        setError('El peso de compra es obligatorio para nuevos ingredientes');
        return;
      }
      if (!formData.precio || formData.precio <= 0) {
        setError('El precio es obligatorio para nuevos ingredientes');
        return;
      }
    }

    // Verificar si ya existe (solo para nuevos ingredientes)
    if (!isEditing) {
      const exists = ingredients.some(
        ing => ing.ingrediente.toLowerCase() === formData.ingrediente.trim().toLowerCase()
      );
      if (exists) {
        setError('Este ingrediente ya está en la lista');
        return;
      }
    }

    // Verificar duplicado al editar (si cambió el nombre)
    if (isEditing && formData.ingrediente.trim().toLowerCase() !== ingredient.ingrediente.toLowerCase()) {
      const exists = ingredients.some(
        ing => ing.ingrediente.toLowerCase() === formData.ingrediente.trim().toLowerCase()
      );
      if (exists) {
        setError('Ya existe otro ingrediente con este nombre');
        return;
      }
    }

    onSave({
      ...ingredient,
      ...formData,
      ingrediente: formData.ingrediente.trim(),
      pesoCompra: formData.pesoCompra ? parseFloat(formData.pesoCompra) : null,
      precio: formData.precio ? parseFloat(formData.precio) : null,
      merma: formData.merma ? parseFloat(formData.merma) : 0,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-5 z-50" onClick={onClose}>
      <div className="w-full max-w-lg bg-white rounded-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center px-6 py-5 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {isEditing ? 'Editar ingrediente' : 'Nuevo ingrediente'}
          </h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Medida</label>
              <select
                value={formData.medida}
                onChange={(e) => setFormData({ ...formData, medida: e.target.value })}
                className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-400 bg-white"
              >
                <option value="gr">gr</option>
                <option value="und">und</option>
                <option value="ml">ml</option>
                <option value="kg">kg</option>
                <option value="lt">lt</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Grupo</label>
              <select
                value={formData.grupo}
                onChange={(e) => setFormData({ ...formData, grupo: e.target.value })}
                className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-400 bg-white"
              >
                <option value="">Seleccionar...</option>
                {grupos.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              Nombre del ingrediente <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.ingrediente}
              onChange={(e) => {
                setFormData({ ...formData, ingrediente: e.target.value });
                setError('');
              }}
              className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-400"
              placeholder="Ej: Harina de trigo"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Peso de compra {!isEditing && <span className="text-red-500">*</span>}
                {isEditing && !formData.pesoCompra && <span className="text-red-500 text-xs ml-1">(pendiente)</span>}
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.pesoCompra || ''}
                onChange={(e) => {
                  setFormData({ ...formData, pesoCompra: e.target.value });
                  setError('');
                }}
                className={`px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:border-gray-400 ${
                  isEditing && !formData.pesoCompra ? 'border-red-300 bg-red-50/30' : 'border-gray-300'
                }`}
                placeholder="Ej: 1000"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Precio (L) {!isEditing && <span className="text-red-500">*</span>}
                {isEditing && !formData.precio && <span className="text-red-500 text-xs ml-1">(pendiente)</span>}
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.precio || ''}
                onChange={(e) => {
                  setFormData({ ...formData, precio: e.target.value });
                  setError('');
                }}
                className={`px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:border-gray-400 ${
                  isEditing && !formData.precio ? 'border-red-300 bg-red-50/30' : 'border-gray-300'
                }`}
                placeholder="Ej: 150.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Marca</label>
              <input
                type="text"
                value={formData.marca}
                onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-400"
                placeholder="Opcional"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Proveedor</label>
              <input
                type="text"
                value={formData.proveedor}
                onChange={(e) => setFormData({ ...formData, proveedor: e.target.value })}
                className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-400"
                placeholder="Opcional"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">% Merma</label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="0"
                max="100"
                step="1"
                value={formData.merma}
                onChange={(e) => setFormData({ ...formData, merma: e.target.value })}
                className="w-24 px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-400"
                placeholder="0"
              />
              <span className="text-sm text-gray-500">% de pérdida al procesar</span>
            </div>
            {formData.merma > 0 && formData.pesoCompra && (
              <p className="text-xs text-gray-500 mt-1">
                Peso aprovechable: {(parseFloat(formData.pesoCompra) * (1 - parseFloat(formData.merma) / 100)).toFixed(1)}g de {formData.pesoCompra}g
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-3 justify-end px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-5 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800"
          >
            {isEditing ? 'Guardar cambios' : 'Agregar ingrediente'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// MÓDULO DE RECETAS
// ============================================
function RecetasModule({ recipes, ingredients, onAdd, onUpdate, onDelete, configCostos, deliveryPorReceta, onToggleDelivery, isvPorReceta, onToggleISV, precioVentaPorReceta, onUpdatePrecioVenta, onUpdatePrecioCliente, calcularTotales, basesReceta, basesPorReceta, onToggleBaseReceta, calcularCostoPolloFrito, calcularCostoPolloFritoEnsalada, calcularCostoPapasFritas, empaques, empaquesPorReceta, onToggleEmpaque, calcularCostoEmpaques }) {
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [showNewRecipeModal, setShowNewRecipeModal] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [expandedCostos, setExpandedCostos] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrar recetas por búsqueda
  const filteredRecipes = recipes.filter(recipe => 
    recipe.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totales = calcularTotales();
  const costoFijoPorPlato = totales.costoFijoPorPlato;
  const costoPolloFrito = calcularCostoPolloFrito();
  const costoPolloFritoEnsalada = calcularCostoPolloFritoEnsalada();
  const costoPapasFritas = calcularCostoPapasFritas();

  // Helper: obtener datos de ingrediente del banco por nombre
  const getIngredientFromBank = (ingredienteNombre) => {
    return ingredients.find(i => 
      i.ingrediente.toLowerCase() === ingredienteNombre.toLowerCase()
    );
  };

  // Calcular costo total de una sub-receta (siempre usa valores del banco)
  const calcularCostoSubReceta = (subReceta) => {
    const costoTotal = subReceta.ingredientes.reduce((sum, ing) => {
      const bancoIng = getIngredientFromBank(ing.ingredienteNombre);
      if (bancoIng && bancoIng.pesoCompra && bancoIng.precio && ing.peso) {
        const merma = parseFloat(bancoIng.merma) || 0;
        const pesoAprovechable = bancoIng.pesoCompra * (1 - merma / 100);
        if (pesoAprovechable > 0) {
          return sum + (ing.peso / pesoAprovechable) * bancoIng.precio;
        }
      }
      return sum;
    }, 0);
    return costoTotal;
  };

  // Calcular costo por porción de una sub-receta
  const calcularCostoPorcion = (subReceta) => {
    const costoTotal = calcularCostoSubReceta(subReceta);
    if (subReceta.pesoReceta && subReceta.pesoPorcion) {
      return (subReceta.pesoPorcion / subReceta.pesoReceta) * costoTotal;
    }
    return 0;
  };

  // Calcular costo de bases activadas para una receta
  const calcularCostoBases = (recipeId) => {
    const bases = basesPorReceta[recipeId] || {};
    let costoBases = 0;
    if (bases.polloFrito) costoBases += costoPolloFrito;
    if (bases.polloFritoEnsalada) costoBases += costoPolloFritoEnsalada;
    if (bases.papasFritas) costoBases += costoPapasFritas;
    return costoBases;
  };

  // Verificar si tiene bases activadas
  const tieneBasesActivadas = (recipeId) => {
    const bases = basesPorReceta[recipeId] || {};
    return bases.polloFrito || bases.polloFritoEnsalada || bases.papasFritas;
  };

  // Calcular costo directo del plato (sub-recetas + bases, SIN empaques)
  const calcularCostoDirecto = (recipe) => {
    const costoSubRecetas = recipe.subRecetas.reduce((sum, sr) => sum + calcularCostoPorcion(sr), 0);
    const costoBases = calcularCostoBases(recipe.id);
    return costoSubRecetas + costoBases;
  };

  // Obtener color según food cost
  const getFoodCostColor = (foodCost) => {
    if (foodCost <= 30) return { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' };
    if (foodCost <= 35) return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };
    return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' };
  };

  if (selectedRecipe) {
    return (
      <RecipeDetail 
        recipe={selectedRecipe}
        ingredients={ingredients}
        onBack={() => setSelectedRecipe(null)}
        onUpdate={(updated) => {
          onUpdate(updated);
          setSelectedRecipe(updated);
        }}
        calcularCostoSubReceta={calcularCostoSubReceta}
        calcularCostoPorcion={calcularCostoPorcion}
        calcularCostoDirecto={calcularCostoDirecto}
        costoFijoPorPlato={costoFijoPorPlato}
        configCostos={configCostos}
        tieneDelivery={deliveryPorReceta[selectedRecipe.id] || false}
        onToggleDelivery={() => onToggleDelivery(selectedRecipe.id)}
        tieneISV={isvPorReceta[selectedRecipe.id] || false}
        onToggleISV={() => onToggleISV(selectedRecipe.id)}
        precioVenta={precioVentaPorReceta[selectedRecipe.id] || 0}
        onUpdatePrecioVenta={(precio) => onUpdatePrecioVenta(selectedRecipe.id, precio)}
        onUpdatePrecioCliente={(precio) => onUpdatePrecioCliente(selectedRecipe.id, precio)}
        getFoodCostColor={getFoodCostColor}
        basesReceta={basesReceta}
        basesPorReceta={basesPorReceta[selectedRecipe.id] || {}}
        onToggleBaseReceta={(baseKey) => onToggleBaseReceta(selectedRecipe.id, baseKey)}
        calcularCostoBases={() => calcularCostoBases(selectedRecipe.id)}
        costoPolloFrito={costoPolloFrito}
        costoPapasFritas={costoPapasFritas}
        empaques={empaques}
        empaquesPorReceta={empaquesPorReceta[selectedRecipe.id] || {}}
        onToggleEmpaque={(empaqueId) => onToggleEmpaque(selectedRecipe.id, empaqueId)}
        calcularCostoEmpaques={() => calcularCostoEmpaques(selectedRecipe.id)}
      />
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Recetas</h2>
          <p className="text-sm text-gray-500">{filteredRecipes.length} de {recipes.length} receta{recipes.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setShowNewRecipeModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Nueva receta
        </button>
      </div>

      {/* Barra de búsqueda */}
      <div className="mb-4 relative">
        <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Buscar receta..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400"
        />
      </div>

      {/* Info de costo fijo */}
      <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between">
        <span className="text-sm text-gray-600">Costo fijo prorrateado por plato:</span>
        <span className="text-sm font-semibold text-gray-900">L{costoFijoPorPlato.toFixed(2)}</span>
      </div>

      {filteredRecipes.length === 0 ? (
        <div className="text-center py-16 bg-white border border-gray-200 rounded-xl">
          <div className="w-12 h-12 mx-auto mb-4 text-gray-300">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-gray-500 mb-4">{searchTerm ? 'No se encontraron recetas' : 'No hay recetas creadas'}</p>
          {!searchTerm && (
            <button
              onClick={() => setShowNewRecipeModal(true)}
              className="text-sm text-gray-900 font-medium hover:underline"
            >
              Crear primera receta
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredRecipes.map((recipe) => {
            // Costo directo = subrecetas + bases (SIN empaques)
            const costoDirecto = calcularCostoDirecto(recipe);
            // Empaques/materiales
            const costoEmpaquesReceta = calcularCostoEmpaques(recipe.id);
            const tieneEmpaques = costoEmpaquesReceta > 0;
            // Costo Total = Costo Directo + Empaques (SIN costo fijo)
            const costoTotal = costoDirecto + costoEmpaquesReceta;
            const tieneDelivery = deliveryPorReceta[recipe.id] || false;
            const precioVenta = precioVentaPorReceta[recipe.id] || 0;
            const tieneISV = isvPorReceta[recipe.id] || false;
            const montoISV = tieneISV ? precioVenta * (configCostos.porcentajeISV / 100) : 0;
            const precioBase = precioVenta + montoISV;
            // Delivery se SUMA al precio cliente (el cliente paga el delivery)
            const montoDelivery = tieneDelivery ? precioBase * (configCostos.porcentajeDelivery / 100) : 0;
            const precioCliente = precioBase + montoDelivery;
            // Food Cost = Costo Directo / Precio Venta (NUNCA usa costo fijo)
            const foodCost = precioVenta > 0 ? (costoDirecto / precioVenta) * 100 : 0;
            // Margen Real = Precio Venta - Costo Total - Costo Fijo (delivery lo paga el cliente)
            const margenReal = precioVenta - costoTotal - costoFijoPorPlato;
            const foodCostColors = getFoodCostColor(foodCost);
            const basesActivas = basesPorReceta[recipe.id] || {};
            const tieneBases = basesActivas.polloFrito || basesActivas.polloFritoEnsalada || basesActivas.papasFritas;
            const tieneExtras = tieneBases || tieneEmpaques;
            
            return (
              <div
                key={recipe.id}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-gray-300 transition-all"
              >
                <div className="flex items-center gap-4 p-5">
                  <button
                    onClick={() => setSelectedRecipe(recipe)}
                    className="flex-1 flex items-center gap-4 text-left"
                  >
                    <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-lg text-gray-500">
                      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{recipe.nombre}</h3>
                      <p className="text-sm text-gray-500">{recipe.subRecetas.length} sub-receta{recipe.subRecetas.length !== 1 ? 's' : ''}</p>
                    </div>
                    <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </button>
                  <div className="flex items-center gap-1 border-l border-gray-200 pl-4">
                    <button
                      onClick={() => setDeleteConfirm(recipe)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Eliminar"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Desplegable Resumen de costos y PVP */}
                <div className="px-5 pb-5 pt-0">
                  <button
                    onClick={() => setExpandedCostos(prev => ({ ...prev, [recipe.id]: !prev[recipe.id] }))}
                    className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors mb-2"
                  >
                    <span className="font-medium text-gray-700">Resumen de costos y PVP</span>
                    <svg
                      className={`w-5 h-5 text-gray-500 transition-transform ${expandedCostos[recipe.id] ? 'rotate-180' : ''}`}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {expandedCostos[recipe.id] && (
                    <div className="mt-3 space-y-4">
                      {/* Costos principales */}
                      <div className="grid grid-cols-3 gap-3 text-sm">
                        <div className={`rounded-lg p-3 ${tieneBases ? 'bg-amber-50' : 'bg-gray-50'}`}>
                          <p className={`text-xs mb-1 ${tieneBases ? 'text-amber-600' : 'text-gray-500'}`}>
                            Costo Directo {tieneBases ? '(+bases)' : ''}
                          </p>
                          <p className={`font-semibold ${tieneBases ? 'text-amber-700' : 'text-gray-900'}`}>L{costoDirecto.toFixed(2)}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-gray-500 text-xs mb-1">Costo Fijo Prorrateado</p>
                          <p className="font-semibold text-gray-900">L{costoFijoPorPlato.toFixed(2)}</p>
                        </div>
                        <div className={`rounded-lg p-3 ${tieneEmpaques ? 'bg-purple-50' : 'bg-blue-50'}`}>
                          <p className={`text-xs mb-1 ${tieneEmpaques ? 'text-purple-600' : 'text-blue-600'}`}>
                            Costo Total {tieneEmpaques ? '(+emp)' : ''}
                          </p>
                          <p className={`font-semibold ${tieneEmpaques ? 'text-purple-700' : 'text-blue-700'}`}>L{costoTotal.toFixed(2)}</p>
                        </div>
                      </div>

                      {/* Precio de venta e ISV */}
                      <div className="grid grid-cols-5 gap-3 text-sm p-4 bg-gray-50 rounded-lg">
                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                          <p className="text-gray-500 text-xs mb-1">Precio Venta</p>
                          <div className="flex items-baseline">
                            <span className="text-gray-400 text-sm mr-0.5">L</span>
                            <input
                              type="number"
                              value={precioVenta || ''}
                              onChange={(e) => onUpdatePrecioVenta(recipe.id, e.target.value)}
                              className="w-full bg-transparent font-semibold text-gray-900 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              placeholder="0.00"
                            />
                          </div>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                          <p className="text-gray-500 text-xs mb-1">ISV ({configCostos.porcentajeISV}%)</p>
                          <p className={`font-semibold ${tieneISV ? 'text-gray-900' : 'text-gray-400'}`}>
                            L{montoISV.toFixed(2)}
                          </p>
                        </div>
                        <div className={`rounded-lg p-3 border ${tieneDelivery ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'}`}>
                          <p className={`text-xs mb-1 ${tieneDelivery ? 'text-blue-600' : 'text-gray-500'}`}>
                            PVP {tieneDelivery ? `(+${configCostos.porcentajeDelivery}%)` : ''}
                          </p>
                          <div className="flex items-baseline">
                            <span className={`text-sm mr-0.5 ${tieneDelivery ? 'text-blue-400' : 'text-gray-400'}`}>L</span>
                            <input
                              type="number"
                              defaultValue={precioCliente > 0 ? precioCliente.toFixed(2) : ''}
                              key={`pvp-${recipe.id}-${tieneDelivery}-${tieneISV}-${precioVenta}`}
                              onBlur={(e) => onUpdatePrecioCliente(recipe.id, e.target.value)}
                              className={`w-full bg-transparent font-semibold focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${tieneDelivery ? 'text-blue-700' : 'text-gray-900'}`}
                              placeholder="0.00"
                            />
                          </div>
                        </div>
                        <div className={`rounded-lg p-3 border ${precioVenta > 0 ? foodCostColors.bg + ' ' + foodCostColors.border : 'bg-white border-gray-200'}`}>
                          <p className={`text-xs mb-1 ${precioVenta > 0 ? foodCostColors.text : 'text-gray-500'}`}>Food Cost</p>
                          <p className={`font-semibold ${precioVenta > 0 ? foodCostColors.text : 'text-gray-400'}`}>
                            {precioVenta > 0 ? `${foodCost.toFixed(1)}%` : '-'}
                          </p>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                          <p className="text-gray-500 text-xs mb-1">Margen Real</p>
                          <p className={`font-semibold ${margenReal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {precioVenta > 0 ? `L${margenReal.toFixed(2)}` : '-'}
                          </p>
                        </div>
                      </div>

                      {/* Toggles */}
                      <div className="pt-3 border-t border-gray-100">
                        {/* Bases de receta */}
                        <div className="flex items-center gap-4 mb-3 pb-3 border-b border-gray-100 flex-wrap">
                          <span className="text-xs font-medium text-gray-500 uppercase">Bases:</span>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={basesActivas.polloFrito || false}
                              onChange={() => onToggleBaseReceta(recipe.id, 'polloFrito')}
                              className="w-4 h-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                            />
                            <span className="text-sm text-gray-700">Pollo Frito <span className="text-gray-400">(L{costoPolloFrito.toFixed(2)})</span></span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={basesActivas.polloFritoEnsalada || false}
                              onChange={() => onToggleBaseReceta(recipe.id, 'polloFritoEnsalada')}
                              className="w-4 h-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                            />
                            <span className="text-sm text-gray-700">Pollo Ensalada/Sandwich <span className="text-gray-400">(L{costoPolloFritoEnsalada.toFixed(2)})</span></span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={basesActivas.papasFritas || false}
                              onChange={() => onToggleBaseReceta(recipe.id, 'papasFritas')}
                              className="w-4 h-4 rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                            />
                            <span className="text-sm text-gray-700">Papas Fritas <span className="text-gray-400">(L{costoPapasFritas.toFixed(2)})</span></span>
                          </label>
                        </div>

                        {/* Empaques / Materiales */}
                        <div className="mb-3 pb-3 border-b border-gray-100">
                          <span className="text-xs font-medium text-gray-500 uppercase block mb-2">Empaque / Materiales:</span>
                          <div className="flex flex-wrap gap-2">
                            {empaques.map(emp => {
                              const empaquesActivos = empaquesPorReceta[recipe.id] || {};
                              const isActive = empaquesActivos[emp.id] || false;
                              return (
                                <label key={emp.id} className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={isActive}
                                    onChange={() => onToggleEmpaque(recipe.id, emp.id)}
                                    className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                  />
                                  <span className="text-sm text-gray-700">{emp.nombre} <span className="text-gray-400">(L{emp.precio.toFixed(2)})</span></span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600">Delivery (+{configCostos.porcentajeDelivery}%)</span>
                              <button
                                onClick={() => onToggleDelivery(recipe.id)}
                                className={`relative w-10 h-5 rounded-full transition-colors ${tieneDelivery ? 'bg-blue-500' : 'bg-gray-300'}`}
                              >
                                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${tieneDelivery ? 'left-5' : 'left-0.5'}`} />
                              </button>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600">ISV ({configCostos.porcentajeISV}%)</span>
                              <button
                                onClick={() => onToggleISV(recipe.id)}
                                className={`relative w-10 h-5 rounded-full transition-colors ${tieneISV ? 'bg-green-500' : 'bg-gray-300'}`}
                              >
                                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${tieneISV ? 'left-5' : 'left-0.5'}`} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showNewRecipeModal && (
        <NewRecipeModal
          onClose={() => setShowNewRecipeModal(false)}
          onSave={(recipe) => {
            onAdd(recipe);
            setShowNewRecipeModal(false);
          }}
        />
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-5 z-50" onClick={() => setDeleteConfirm(null)}>
          <div className="w-full max-w-sm bg-white rounded-xl p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Eliminar receta</h3>
            <p className="text-gray-600 mb-6">
              ¿Estás seguro que quieres eliminar <strong>"{deleteConfirm.nombre}"</strong>?
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
                No
              </button>
              <button onClick={() => { onDelete(deleteConfirm.id); setDeleteConfirm(null); }} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700">
                Sí
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// MODAL NUEVA RECETA
// ============================================
function NewRecipeModal({ onClose, onSave }) {
  const [nombre, setNombre] = useState('');

  const handleSubmit = () => {
    if (nombre.trim()) {
      onSave({
        nombre: nombre.trim(),
        subRecetas: []
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-5 z-50" onClick={onClose}>
      <div className="w-full max-w-md bg-white rounded-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center px-6 py-5 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Nueva receta</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">
          <div className="flex flex-col gap-1.5 mb-6">
            <label className="text-sm font-medium text-gray-700">Nombre del plato</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-400"
              placeholder="Ej: TGU, Burger Especial..."
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              Cancelar
            </button>
            <button onClick={handleSubmit} className="px-5 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800">
              Crear receta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// DETALLE DE RECETA
// ============================================
function RecipeDetail({ recipe, ingredients, onBack, onUpdate, calcularCostoSubReceta, calcularCostoPorcion, calcularCostoDirecto, costoFijoPorPlato, configCostos, tieneDelivery, onToggleDelivery, tieneISV, onToggleISV, precioVenta, onUpdatePrecioVenta, onUpdatePrecioCliente, getFoodCostColor, basesReceta, basesPorReceta, onToggleBaseReceta, calcularCostoBases, costoPolloFrito, costoPapasFritas, empaques, empaquesPorReceta, onToggleEmpaque, calcularCostoEmpaques }) {
  const [showNewSubReceta, setShowNewSubReceta] = useState(false);
  const [editingSubReceta, setEditingSubReceta] = useState(null);
  const [expandedSubReceta, setExpandedSubReceta] = useState(null);
  const [deleteConfirmSubReceta, setDeleteConfirmSubReceta] = useState(null);
  
  // Estados para editar nombre de receta
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(recipe.nombre);

  // Guardar nuevo nombre
  const handleSaveName = () => {
    if (editedName.trim() && editedName.trim() !== recipe.nombre) {
      const updated = {
        ...recipe,
        nombre: editedName.trim().toUpperCase()
      };
      onUpdate(updated);
    }
    setIsEditingName(false);
  };

  // Cancelar edición
  const handleCancelEdit = () => {
    setEditedName(recipe.nombre);
    setIsEditingName(false);
  };

  // Manejar Enter y Escape
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSaveName();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const handleAddSubReceta = (subReceta) => {
    const updated = {
      ...recipe,
      subRecetas: [...recipe.subRecetas, { ...subReceta, id: 'sr' + Date.now() }]
    };
    onUpdate(updated);
    setShowNewSubReceta(false);
  };

  const handleUpdateSubReceta = (subReceta) => {
    const updated = {
      ...recipe,
      subRecetas: recipe.subRecetas.map(sr => sr.id === subReceta.id ? subReceta : sr)
    };
    onUpdate(updated);
    setEditingSubReceta(null);
  };

  const handleDeleteSubReceta = (subRecetaId) => {
    const updated = {
      ...recipe,
      subRecetas: recipe.subRecetas.filter(sr => sr.id !== subRecetaId)
    };
    onUpdate(updated);
  };

  // Costo directo = subrecetas + bases (SIN empaques)
  const costoDirecto = calcularCostoDirecto(recipe);
  const costoBases = calcularCostoBases ? calcularCostoBases() : 0;
  const costoEmpaquesTotal = calcularCostoEmpaques ? calcularCostoEmpaques() : 0;
  const tieneBasesActivas = basesPorReceta?.polloFrito || basesPorReceta?.polloFritoEnsalada || basesPorReceta?.papasFritas;
  const tieneEmpaquesActivos = costoEmpaquesTotal > 0;
  const tieneExtras = tieneBasesActivas || tieneEmpaquesActivos;
  // Costo Total = Costo Directo + Empaques (SIN costo fijo)
  const costoTotal = costoDirecto + costoEmpaquesTotal;
  
  // Cálculos de ISV y métricas
  const montoISV = tieneISV ? precioVenta * (configCostos.porcentajeISV / 100) : 0;
  const precioBase = precioVenta + montoISV;
  // Delivery se SUMA al precio cliente (el cliente paga el delivery)
  const montoDelivery = tieneDelivery ? precioBase * (configCostos.porcentajeDelivery / 100) : 0;
  const precioCliente = precioBase + montoDelivery;
  // Food Cost = Costo Directo / Precio Venta (NUNCA usa costo fijo)
  const foodCost = precioVenta > 0 ? (costoDirecto / precioVenta) * 100 : 0;
  // Margen Real = Precio Venta - Costo Total - Costo Fijo (delivery lo paga el cliente)
  const margenReal = precioVenta - costoTotal - costoFijoPorPlato;
  const foodCostColors = getFoodCostColor ? getFoodCostColor(foodCost) : { bg: '', text: 'text-gray-500', border: '' };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          {isEditingName ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value.toUpperCase())}
                onKeyDown={handleKeyDown}
                onBlur={handleSaveName}
                autoFocus
                className="text-2xl font-semibold text-gray-900 border-b-2 border-orange-500 bg-transparent focus:outline-none px-1"
                style={{ width: `${Math.max(editedName.length, 5) * 16}px` }}
              />
              <button
                type="button"
                onClick={handleSaveName}
                className="p-1 text-green-600 hover:bg-green-50 rounded"
                title="Guardar"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 13l4 4L19 7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="p-1 text-gray-400 hover:bg-gray-100 rounded"
                title="Cancelar"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-semibold text-gray-900 mb-1">{recipe.nombre}</h2>
              <button
                type="button"
                onClick={() => setIsEditingName(true)}
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                title="Editar nombre"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
            </div>
          )}
          <p className="text-sm text-gray-500">{recipe.subRecetas.length} sub-receta{recipe.subRecetas.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Sub-recetas */}
      <div className="space-y-4">
        {recipe.subRecetas.map((subReceta) => {
          const costoSubReceta = calcularCostoSubReceta(subReceta);
          const costoPorcion = calcularCostoPorcion(subReceta);
          const isExpanded = expandedSubReceta === subReceta.id;

          return (
            <div key={subReceta.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              {/* Header de sub-receta */}
              <div 
                className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => setExpandedSubReceta(isExpanded ? null : subReceta.id)}
              >
                <svg className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18l6-6-6-6" />
                </svg>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{subReceta.nombre}</h3>
                  <p className="text-xs text-gray-500">{subReceta.ingredientes.length} ingredientes</p>
                </div>
                <div className="text-right mr-4">
                  <p className="text-sm font-semibold text-gray-900">L{costoPorcion.toFixed(2)}</p>
                  <p className="text-xs text-gray-500">por porción ({subReceta.pesoPorcion}g)</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); setEditingSubReceta(subReceta); }}
                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                    title="Editar"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setDeleteConfirmSubReceta(subReceta); }}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                    title="Eliminar"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Tabla de ingredientes expandida */}
              {isExpanded && (
                <div className="border-t border-gray-200">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 text-gray-600">
                        <th className="text-left px-4 py-2 font-medium">Ingrediente</th>
                        <th className="text-right px-4 py-2 font-medium">Peso</th>
                        <th className="text-right px-4 py-2 font-medium">Peso compra</th>
                        <th className="text-right px-4 py-2 font-medium">Precio compra</th>
                        <th className="text-right px-4 py-2 font-medium">Costo</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {subReceta.ingredientes.map((ing) => {
                        const bancoIng = ingredients.find(i => i.ingrediente.toLowerCase() === ing.ingredienteNombre.toLowerCase());
                        const merma = parseFloat(bancoIng?.merma) || 0;
                        const pesoCompra = bancoIng?.pesoCompra || 0;
                        const precioCompra = bancoIng?.precio || 0;
                        const pesoAprovechable = pesoCompra * (1 - merma / 100);
                        const costo = pesoCompra && precioCompra && pesoAprovechable > 0 ? (ing.peso / pesoAprovechable) * precioCompra : 0;
                        const sinPesoCompra = !pesoCompra || pesoCompra === 0;
                        const sinPrecioCompra = !precioCompra || precioCompra === 0;
                        const isPendienteValidacion = bancoIng?.pendienteValidacion === true;
                        return (
                          <tr key={ing.id} className={!bancoIng && ing.ingredienteNombre ? 'bg-red-50' : isPendienteValidacion ? 'bg-yellow-50/50' : ''}>
                            <td className="px-4 py-2 text-gray-900">
                              {ing.ingredienteNombre}
                              {merma > 0 && <span className="ml-2 text-xs text-amber-600">({merma}% merma)</span>}
                              {!bancoIng && ing.ingredienteNombre && <span className="ml-2 text-xs text-red-600">(No en banco)</span>}
                              {isPendienteValidacion && <span className="ml-2 text-xs text-yellow-600">(Por validar)</span>}
                            </td>
                            <td className="px-4 py-2 text-right text-gray-600">{ing.peso}g</td>
                            <td className={`px-4 py-2 text-right ${sinPesoCompra ? 'text-red-500 font-medium' : 'text-gray-600'}`}>
                              {sinPesoCompra ? '0' : pesoCompra}
                            </td>
                            <td className={`px-4 py-2 text-right ${sinPrecioCompra ? 'text-red-500 font-medium' : 'text-gray-600'}`}>
                              {sinPrecioCompra ? 'L0.00' : `L${precioCompra.toFixed(2)}`}
                            </td>
                            <td className={`px-4 py-2 text-right font-medium ${costo === 0 && (sinPesoCompra || sinPrecioCompra) ? 'text-red-500' : 'text-gray-900'}`}>
                              L{costo.toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="bg-gray-50 font-medium">
                        <td className="px-4 py-2 text-gray-700">TOTAL</td>
                        <td colSpan="3"></td>
                        <td className="px-4 py-2 text-right text-gray-900">L{costoSubReceta.toFixed(2)}</td>
                      </tr>
                      <tr className="bg-gray-100">
                        <td className="px-4 py-2 text-gray-600">Peso de la receta</td>
                        <td className="px-4 py-2 text-right font-medium" colSpan="4">{subReceta.pesoReceta}g</td>
                      </tr>
                      <tr className="bg-gray-100">
                        <td className="px-4 py-2 text-gray-600">Peso por porción</td>
                        <td className="px-4 py-2 text-right font-medium" colSpan="4">{subReceta.pesoPorcion}g</td>
                      </tr>
                      <tr className="bg-green-50">
                        <td className="px-4 py-2 text-green-700 font-medium">Costo por porción</td>
                        <td className="px-4 py-2 text-right font-bold text-green-700" colSpan="4">L{costoPorcion.toFixed(2)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          );
        })}

        {/* Botón agregar sub-receta */}
        <button
          onClick={() => setShowNewSubReceta(true)}
          className="flex items-center gap-3 w-full p-4 bg-gray-50 border border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-gray-400 hover:bg-gray-100 transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Agregar sub-receta
        </button>
      </div>

      {/* Resumen de costos */}
      {recipe.subRecetas.length > 0 && (
        <div className="mt-6 p-4 bg-gray-900 rounded-xl text-white">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-400 text-sm">Resumen de costos</p>
              <div className="flex gap-6 mt-2">
                {recipe.subRecetas.map((sr) => (
                  <div key={sr.id} className="text-sm">
                    <span className="text-gray-400">{sr.nombre}:</span>
                    <span className="ml-2 font-medium">L{calcularCostoPorcion(sr).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="text-right">
              <p className="text-gray-400 text-sm">Costo total del plato</p>
              <p className="text-3xl font-bold">L{costoDirecto.toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Modal nueva sub-receta */}
      {showNewSubReceta && (
        <SubRecetaModal
          ingredients={ingredients}
          onClose={() => setShowNewSubReceta(false)}
          onSave={handleAddSubReceta}
        />
      )}

      {/* Modal editar sub-receta */}
      {editingSubReceta && (
        <SubRecetaModal
          subReceta={editingSubReceta}
          ingredients={ingredients}
          onClose={() => setEditingSubReceta(null)}
          onSave={handleUpdateSubReceta}
        />
      )}

      {/* Modal confirmación eliminar sub-receta */}
      {deleteConfirmSubReceta && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-5 z-50" onClick={() => setDeleteConfirmSubReceta(null)}>
          <div className="w-full max-w-sm bg-white rounded-xl p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Eliminar sub-receta</h3>
            <p className="text-gray-600 mb-6">
              ¿Estás seguro que quieres eliminar <strong>"{deleteConfirmSubReceta.nombre}"</strong>?
            </p>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setDeleteConfirmSubReceta(null)} 
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                No
              </button>
              <button 
                onClick={() => { 
                  handleDeleteSubReceta(deleteConfirmSubReceta.id);
                  setDeleteConfirmSubReceta(null); 
                }} 
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
              >
                Sí
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// MODAL SUB-RECETA
// ============================================
function SubRecetaModal({ subReceta, ingredients, onClose, onSave }) {
  const isEditing = !!subReceta;
  const [nombre, setNombre] = useState(subReceta?.nombre || '');
  const [ingredientesReceta, setIngredientesReceta] = useState(
    subReceta?.ingredientes?.map(ing => ({
      id: ing.id,
      ingredienteNombre: ing.ingredienteNombre,
      peso: ing.peso
    })) || []
  );
  const [pesoReceta, setPesoReceta] = useState(subReceta?.pesoReceta || '');
  const [pesoPorcion, setPesoPorcion] = useState(subReceta?.pesoPorcion || '');

  // Helper: obtener datos del ingrediente del banco
  const getIngredientFromBank = (ingredienteNombre) => {
    return ingredients.find(i => 
      i.ingrediente.toLowerCase() === ingredienteNombre.toLowerCase()
    );
  };

  const handleAddIngrediente = () => {
    setIngredientesReceta([...ingredientesReceta, {
      id: 'i' + Date.now(),
      ingredienteNombre: '',
      peso: ''
    }]);
  };

  const handleUpdateIngrediente = (index, field, value) => {
    const updated = [...ingredientesReceta];
    updated[index][field] = value;
    setIngredientesReceta(updated);
  };

  const handleSelectIngrediente = (index, ingredienteNombre) => {
    const updated = [...ingredientesReceta];
    updated[index].ingredienteNombre = ingredienteNombre;
    setIngredientesReceta(updated);
  };

  const handleRemoveIngrediente = (index) => {
    setIngredientesReceta(ingredientesReceta.filter((_, i) => i !== index));
  };

  // Calcular costo usando valores del banco
  const calcularCostoIngrediente = (ing) => {
    const bancoIng = getIngredientFromBank(ing.ingredienteNombre);
    if (bancoIng && bancoIng.pesoCompra && bancoIng.precio && ing.peso) {
      const merma = parseFloat(bancoIng.merma) || 0;
      const pesoAprovechable = parseFloat(bancoIng.pesoCompra) * (1 - merma / 100);
      if (pesoAprovechable > 0) {
        return (parseFloat(ing.peso) / pesoAprovechable) * parseFloat(bancoIng.precio);
      }
    }
    return 0;
  };

  const costoTotal = ingredientesReceta.reduce((sum, ing) => sum + calcularCostoIngrediente(ing), 0);
  
  const costoPorcion = pesoReceta && pesoPorcion 
    ? (parseFloat(pesoPorcion) / parseFloat(pesoReceta)) * costoTotal 
    : 0;

  const handleSubmit = () => {
    if (nombre.trim() && ingredientesReceta.length > 0) {
      onSave({
        id: subReceta?.id,
        nombre: nombre.trim(),
        ingredientes: ingredientesReceta.map(ing => ({
          id: ing.id,
          ingredienteNombre: ing.ingredienteNombre,
          peso: parseFloat(ing.peso) || 0
        })),
        pesoReceta: parseFloat(pesoReceta) || 0,
        pesoPorcion: parseFloat(pesoPorcion) || 0
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-5 z-50" onClick={onClose}>
      <div className="w-full max-w-4xl bg-white rounded-xl overflow-hidden max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {isEditing ? 'Editar sub-receta' : 'Nueva sub-receta'}
          </h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {/* Nombre */}
          <div className="flex flex-col gap-1.5 mb-6">
            <label className="text-sm font-medium text-gray-700">Nombre de la sub-receta</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-400"
              placeholder="Ej: SALSA BLANCA, BBQ CATRACHA..."
            />
          </div>

          {/* Nota sobre sincronización */}
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-700">
              <span className="font-semibold">ℹ️ Sincronizado:</span> Los valores de peso de compra, precio y merma se obtienen automáticamente del banco de ingredientes y se actualizan en tiempo real.
            </p>
          </div>

          {/* Tabla de ingredientes */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm font-medium text-gray-700">Ingredientes</label>
              <button
                onClick={handleAddIngrediente}
                className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Agregar ingrediente
              </button>
            </div>

            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left px-3 py-2 font-medium text-gray-700">Ingrediente</th>
                    <th className="text-right px-3 py-2 font-medium text-gray-700 w-24">Peso (g)</th>
                    <th className="text-right px-3 py-2 font-medium text-gray-700 w-28">Peso compra</th>
                    <th className="text-right px-3 py-2 font-medium text-gray-700 w-20">Merma</th>
                    <th className="text-right px-3 py-2 font-medium text-gray-700 w-28">Precio compra</th>
                    <th className="text-right px-3 py-2 font-medium text-gray-700 w-24">Costo</th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {ingredientesReceta.map((ing, index) => {
                    const bancoIng = getIngredientFromBank(ing.ingredienteNombre);
                    const noEncontrado = ing.ingredienteNombre && !bancoIng;
                    return (
                      <tr key={ing.id} className={noEncontrado ? 'bg-red-50' : ''}>
                        <td className="px-3 py-2">
                          <IngredienteAutocomplete
                            value={ing.ingredienteNombre}
                            ingredients={ingredients}
                            onChange={(value) => handleUpdateIngrediente(index, 'ingredienteNombre', value)}
                            onSelect={(value) => handleSelectIngrediente(index, value)}
                          />
                          {noEncontrado && (
                            <p className="text-xs text-red-600 mt-1">No encontrado en banco</p>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            value={ing.peso}
                            onChange={(e) => handleUpdateIngrediente(index, 'peso', e.target.value)}
                            className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm text-right focus:outline-none focus:border-gray-400"
                            placeholder="0"
                          />
                        </td>
                        <td className="px-3 py-2 text-right text-gray-600">
                          {bancoIng?.pesoCompra ? `${bancoIng.pesoCompra}g` : '-'}
                        </td>
                        <td className="px-3 py-2 text-right">
                          {bancoIng?.merma > 0 ? (
                            <span className="inline-block px-2 py-1 bg-amber-50 text-amber-700 rounded text-xs font-medium">
                              {bancoIng.merma}%
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs">0%</span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-right text-gray-600">
                          {bancoIng?.precio ? `L${bancoIng.precio.toFixed(2)}` : '-'}
                        </td>
                        <td className="px-3 py-2 text-right font-medium text-gray-900">
                          L{calcularCostoIngrediente(ing).toFixed(2)}
                        </td>
                        <td className="px-2 py-2">
                          <button
                            onClick={() => handleRemoveIngrediente(index)}
                            className="p-1 text-gray-400 hover:text-red-600"
                          >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {ingredientesReceta.length === 0 && (
                    <tr>
                      <td colSpan="7" className="px-3 py-8 text-center text-gray-500">
                        Haz clic en "Agregar ingrediente" para comenzar
                      </td>
                    </tr>
                  )}
                </tbody>
                {ingredientesReceta.length > 0 && (
                  <tfoot>
                    <tr className="bg-gray-50 font-medium">
                      <td colSpan="5" className="px-3 py-2 text-gray-700">TOTAL</td>
                      <td className="px-3 py-2 text-right text-gray-900">L{costoTotal.toFixed(2)}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>

          {/* Peso receta y porción */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Peso de la receta (g)</label>
              <input
                type="number"
                value={pesoReceta}
                onChange={(e) => setPesoReceta(e.target.value)}
                className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-400"
                placeholder="Suma total de pesos"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Peso por porción (g)</label>
              <input
                type="number"
                value={pesoPorcion}
                onChange={(e) => setPesoPorcion(e.target.value)}
                className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-400"
                placeholder="Cantidad usada en el plato"
              />
            </div>
          </div>

          {/* Costo por porción */}
          {pesoReceta && pesoPorcion && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-green-700 font-medium">Costo por porción</span>
                <span className="text-xl font-bold text-green-700">L{costoPorcion.toFixed(2)}</span>
              </div>
              <p className="text-sm text-green-600 mt-1">
                ({pesoPorcion}g de {pesoReceta}g totales)
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-3 justify-end px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            Cancelar
          </button>
          <button onClick={handleSubmit} className="px-5 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800">
            {isEditing ? 'Guardar cambios' : 'Crear sub-receta'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// AUTOCOMPLETE DE INGREDIENTES
// ============================================
function IngredienteAutocomplete({ value, ingredients, onChange, onSelect }) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  const handleChange = (e) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    if (newValue.length >= 2) {
      const filtered = ingredients.filter(ing =>
        ing.ingrediente.toLowerCase().includes(newValue.toLowerCase())
      ).slice(0, 8);
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSelect = (ingrediente) => {
    onSelect(ingrediente.ingrediente);
    setShowSuggestions(false);
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={handleChange}
        onFocus={() => value.length >= 2 && suggestions.length > 0 && setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-gray-400"
        placeholder="Buscar ingrediente..."
      />
      {showSuggestions && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {suggestions.map((ing) => (
            <button
              key={ing.id}
              onClick={() => handleSelect(ing)}
              className="w-full px-3 py-2 text-left hover:bg-gray-100 text-sm flex justify-between"
            >
              <span>{ing.ingrediente}</span>
              {ing.pesoCompra && ing.precio && (
                <span className="text-gray-500 text-xs">
                  {ing.pesoCompra}g / L{ing.precio}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
