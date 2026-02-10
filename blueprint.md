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
*   **Drag-and-Drop Reordering:** Users can reorder objectives, key results within an objective, and action items within a key result using a drag-and-drop interface.

## Current Task: Refactor to Eliminate Prop Drilling

**Goal:** Refactor the component hierarchy to eliminate prop drilling by using React's Context API.

**Plan:**

1.  **[DONE]** Create `src/contexts/ObjectiveContext.tsx` to define a new `ObjectiveContext` that will hold all the callback functions.
2.  **[DONE]** In `App.tsx`, wrap the `ObjectiveList` component with an `ObjectiveContext.Provider` and pass a `contextValue` object containing all the handler functions.
3.  **[DONE]** Refactor `ObjectiveList.tsx` to remove all the callback props that are now provided by the context.
4.  **[DONE]** Refactor `ObjectiveItem.tsx` to use the `useObjectiveContext` hook and call the context functions directly.
5.  **[DONE]** Refactor `KeyResultItem.tsx` to use the `useObjectiveContext` hook and call the context functions directly.
6.  **[DONE]** Refactor `ActionItemItem.tsx` to use the `useObjectiveContext` hook and call the context functions directly.
