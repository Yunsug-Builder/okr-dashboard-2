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
*   **Context API Refactoring:** The codebase was refactored to use the React Context API, eliminating prop drilling and improving maintainability.

## Current Task: Fix Missing Loading State

**Goal:** Prevent double submissions and provide visual feedback to the user during save operations.

**Plan:**

1.  **[DONE]** Introduce an `isSaving` state variable in `App.tsx`.
2.  **[DONE]** Disable the "Add New Objective" and "Save" buttons when `isSaving` is true.
3.  **[DONE]** Display a loading indicator on the buttons during the save operation.
4.  **[DONE]** Pass the `isSaving` state to the `EditModal` component.
