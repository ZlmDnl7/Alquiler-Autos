#!/bin/bash

echo "Ejecutando pruebas unitarias y generando coverage..."

# Ejecutar pruebas del backend
echo " Ejecutando pruebas del backend..."
cd backend
npm test
cd ..

# Ejecutar pruebas del frontend
echo " Ejecutando pruebas del frontend..."
cd client
npm test
cd ..

# Verificar que los archivos de coverage existen
echo " Verificando archivos de coverage..."
if [ -f "backend/coverage/lcov.info" ]; then
    echo " Backend coverage generado correctamente"
else
    echo " Error: Backend coverage no encontrado"
    exit 1
fi

if [ -f "client/coverage/lcov.info" ]; then
    echo " Frontend coverage generado correctamente"
else
    echo " Error: Frontend coverage no encontrado"
    exit 1
fi

echo " Todas las pruebas ejecutadas correctamente"
echo " Archivos de coverage listos para SonarQube:"
echo "   - backend/coverage/lcov.info"
echo "   - client/coverage/lcov.info"
echo ""
echo " Para ejecutar SonarQube:"
echo "   sonar-scanner"
