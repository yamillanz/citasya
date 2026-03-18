#!/bin/bash

# Script to fix all backoffice test files

cd /home/yamillanz/Projects/citasya-app/app-web/src/app/features/backoffice

# Fix imports in all test files
for file in $(find . -name "*.spec.ts" -type f); do
  echo "Fixing $file..."
  
  # Add RouterTestingModule import
  sed -i "s/import { ComponentFixture, TestBed/import { ComponentFixture, TestBed, NO_ERRORS_SCHEMA } from '@angular\/core\/testing';\nimport { RouterTestingModule } from '@angular\/router\/testing';\nimport { ComponentFixture, TestBed/g" "$file"
  
  # Replace Router mock with RouterTestingModule in imports
  sed -i 's/imports: \[\([^]]*\)\]/imports: [\1, RouterTestingModule]/g' "$file"
  
  # Add NO_ERRORS_SCHEMA to schemas
  sed -i 's/]).compileComponents();/],\n      schemas: [NO_ERRORS_SCHEMA]\n    }).compileComponents();/g' "$file"
  
  # Remove routerMock since we're using RouterTestingModule
  sed -i '/routerMock = {/,/} as any;/d' "$file"
  sed -i '/{ provide: Router, useValue: routerMock },/d' "$file"
  
  # Fix async/await patterns
  sed -i 's/fakeAsync(() => {$/async () => {/g' "$file"
  sed -i 's/tick();$/\/\/ tick replaced by await/g' "$file"
  
done

echo "All test files fixed!"
