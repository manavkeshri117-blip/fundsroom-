# Interview Notes

## Why MongoDB/Mongoose?
It matches the JavaScript learning stack and Mongoose provides schema validation, models and references. If the evaluator strictly requires PostgreSQL/MySQL, the persistence layer should be migrated.

## Authentication vs authorization
Authentication verifies identity. Authorization checks permissions. JWT carries the authenticated identity and role; authorization middleware checks allowed roles.

## Why prevent negative stock?
Inventory is a business invariant. A confirmed dispatch cannot consume more units than are available.

## Why product snapshots?
Product names, SKUs and prices can change. Historical challans should preserve the values that were true when they were created.

## Why Draft and Confirmed?
Draft preparation must not change stock. Confirmation is the business event that validates and deducts inventory.

## Why stock movements?
Current stock shows the present state. Movement records explain how the state changed and provide an audit trail.

## What is RBAC?
Role-based access control. Permissions are attached to Admin, Sales, Warehouse and Accounts roles.
