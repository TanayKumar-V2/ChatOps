# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Delegated: TypeScript monorepo with an Express/Socket.io API, React/Vite frontend, Neon PostgreSQL, Redis, Docker Compose, and GitHub Actions.

## Users

Small technical teams who need to communicate in persistent rooms while watching presence and typing state in real time.

## Product Purpose

ChatOps provides a focused real-time team chat workspace with room-based conversations, durable message history, online presence, and typing indicators.

## Positioning

The product demonstrates the complete real-time backend loop: authenticated Socket.io connections, persisted Neon messages, Redis presence, and repeatable containerized delivery.

## Operating Context

Users open the web app, select a room, read older messages, send messages, see who is online, and receive new messages without refreshing. Developers run the full stack locally with Docker and validate changes through CI.

## Capabilities and Constraints

- JWT authentication is required for HTTP and Socket.io connections.
- Rooms support joining, leaving, messaging, typing indicators, and presence updates.
- Messages are persisted in Neon PostgreSQL and retrieved with cursor pagination.
- Redis stores expiring presence state and supports multi-instance Socket.io delivery.
- The frontend must be responsive and usable on desktop and mobile.
- The interface should be polished, accessible, and operationally clear rather than decorative.

## Brand Commitments

The product name is ChatOps. The interface is a dark technical workspace with a restrained palette and one cyan accent.

## Evidence on Hand

The fifth-project requirements from the supplied backend concepts guide. No production users, brand assets, or real content were supplied; demo content must be clearly synthetic.

## Product Principles

- Real-time state should be visible and understandable.
- Persistence comes before broadcast so history remains trustworthy.
- Authentication and room authorization apply to every transport.
- The happy path and failure states should both be easy to diagnose.
- Local setup and deployment should be reproducible.

## Accessibility & Inclusion

Use semantic HTML, keyboard-accessible controls, visible focus states, readable contrast, reduced-motion support, and responsive layouts.
