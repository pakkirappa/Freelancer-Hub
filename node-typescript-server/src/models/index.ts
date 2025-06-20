// This file exports data models that define the structure of the data used in the application.

export interface User {
    id: number;
    name: string;
    email: string;
}

export interface Post {
    id: number;
    title: string;
    content: string;
    authorId: number;
}

export interface Comment {
    id: number;
    postId: number;
    content: string;
    authorId: number;
}