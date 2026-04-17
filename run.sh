#!/bin/bash

# Este script executa o comando npm start na raiz, 
# repassando todos os argumentos para o processo do backend.
# Exemplo: ./run.sh --map=map.ascii --bookings=bookings.json

npm start "$@"
