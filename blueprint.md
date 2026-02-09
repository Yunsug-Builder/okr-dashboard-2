# Project Blueprint: OKR Dashboard

## Overview

This document outlines the structure, features, and development plan for the OKR (Objectives and Key Results) Dashboard application. The application is designed to help users track their goals by setting objectives, defining key results, and managing action items.

## Implemented Features

*   **User Authentication:** Users can sign in with their Google account to access their personal OKR dashboard.
*   **Firebase Integration:** The application is connected to a Firebase backend for data storage and authentication.
*   **Core OKR Components:**
    *   **Objectives:** High-level goals that users want to achieve.
    *   **Key Results:** Measurable outcomes that define the success of an objective.
    *   **Action Items:** Specific tasks that need to be completed to achieve a key result.
*   **CRUD Operations:** Users can create, read, update, and delete objectives, key results, and action items.
*   **Progress Tracking:** The application automatically calculates and displays the progress of each key result and objective based on the completion of action items.
*   **Nested, Collapsible UI:** The user interface presents the OKR hierarchy in a nested and collapsible format, making it easy to navigate and manage.
*   **Date-Based Sorting:** All items are sorted by their due date.
*   **Modal-Based Editing:** A unified modal is used for creating and editing all types of items.

## Current Task: Implement Drag-and-Drop Reordering

**Goal:** Enable users to reorder objectives, key results within an objective, and action items within a key result using a drag-and-drop interface.

**Library:** `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`

**Plan:**

1.  **[DONE]** Install necessary `@dnd-kit` packages.
2.  **[DONE]** Create `blueprint.md` for project documentation.
3.  **Refactor Components:** Break down `ObjectiveList.tsx` into smaller, more focused components (`ObjectiveItem.tsx`, `KeyResultItem.tsx`, `ActionItemItem.tsx`) to simplify the implementation of drag-and-drop.
4.  **Create Reusable `SortableItem`:** Develop a generic `SortableItem.tsx` component that encapsulates the `useSortable` hook and handles the drag-and-drop styles and attributes.
5.  **Integrate `DndContext`:** Wrap the main list in `App.tsx` with `DndContext` to manage the drag-and-drop state.
6.  **Implement `SortableContext`:** Use `SortableContext` for each list (objectives, key results, and action items) to enable sorting within those lists.
7.  **Update State in `App.tsx`:** Implement the `handleDragEnd` function to optimistically update the `objectives` state in `App.tsx` when an item is moved. The function will initially log the new order to the console for verification.
