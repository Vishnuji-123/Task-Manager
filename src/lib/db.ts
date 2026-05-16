import { collection, query, where, orderBy, getDocs, doc, setDoc, updateDoc, deleteDoc, serverTimestamp, onSnapshot, collectionGroup } from 'firebase/firestore';
import { db } from './firebase';

export type UserProfile = {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'member' | 'unassigned';
  photoURL?: string;
  assignedProjectId?: string;
  createdAt: any;
};

export type TeamMember = {
  userId: string;
  role: 'admin' | 'Tasker' | 'QR' | 'QL' | 'PL';
  joinedAt: any;
};

export type Team = {
  id: string;
  projectId: string;
  title: string;
  description: string;
  createdAt: any;
  updatedAt: any;
};

export type Project = {
  id: string;
  title: string;
  description: string;
  ownerId: string;
  createdAt: any;
  updatedAt: any;
};

export type Task = {
  id: string;
  projectId: string;
  teamId?: string;
  title: string;
  description: string;
  status: 'To Do' | 'In Progress' | 'Done';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  assigneeId?: string;
  creatorId: string;
  dueDate?: any;
  createdAt: any;
  updatedAt: any;
};

// Error handler specified by firebase integration rules
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: any;
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {}, // In a real app we'd inject auth state here, for simplicity avoiding auth import loop
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// APIs
export async function createProject(data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) {
  const newRef = doc(collection(db, 'projects'));
  try {
    const proj = {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    await setDoc(newRef, proj);
    return newRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'projects');
  }
}

export async function createTeam(projectId: string, title: string, description: string, memberIds: string[] = []) {
  const newRef = doc(collection(db, 'projects', projectId, 'teams'));
  try {
    const team = {
      projectId,
      title,
      description,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    await setDoc(newRef, team);
    
    // Add members to team and update their assignedProjectId
    const promises = memberIds.map(async userId => {
      const memberRef = doc(db, 'projects', projectId, 'teams', newRef.id, 'members', userId);
      await setDoc(memberRef, {
        userId,
        role: 'Tasker', // Default role
        joinedAt: serverTimestamp()
      });
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { assignedProjectId: projectId });
    });
    
    await Promise.all(promises);
    return newRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'teams');
  }
}

export async function updateTeamInfo(projectId: string, teamId: string, title: string, description: string) {
  try {
    const teamRef = doc(db, 'projects', projectId, 'teams', teamId);
    await updateDoc(teamRef, {
      title,
      description,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, 'teams');
  }
}

export async function addTeamMember(projectId: string, teamId: string, userId: string, role: TeamMember['role'] = 'Tasker') {
  try {
    const memberRef = doc(db, 'projects', projectId, 'teams', teamId, 'members', userId);
    await setDoc(memberRef, {
      userId,
      role,
      joinedAt: serverTimestamp()
    });
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { assignedProjectId: projectId });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'members');
  }
}

export async function removeTeamMember(projectId: string, teamId: string, userId: string, unassignProject: boolean = true) {
  try {
    const memberRef = doc(db, 'projects', projectId, 'teams', teamId, 'members', userId);
    await deleteDoc(memberRef);
    if (unassignProject) {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { assignedProjectId: null });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, 'members');
  }
}

export async function getAllUsers() {
  try {
    const q = query(collection(db, 'users'), orderBy('name', 'asc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as UserProfile));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'users');
    return [];
  }
}

export function subscribeToTeams(projectId: string, callback: (teams: Team[]) => void) {
  const q = query(collection(db, 'projects', projectId, 'teams'), orderBy('title', 'asc'));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Team)));
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'teams');
  });
}

export function subscribeToAllTeams(callback: (teams: Team[]) => void) {
  const q = query(collectionGroup(db, 'teams'));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Team)));
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'teams');
  });
}

export function subscribeToTeamMembers(projectId: string, teamId: string, callback: (members: TeamMember[]) => void) {
  const q = query(collection(db, 'projects', projectId, 'teams', teamId, 'members'));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(d => d.data() as TeamMember));
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'members');
  });
}

export async function updateMemberRole(projectId: string, teamId: string, userId: string, newRole: 'admin' | 'Tasker' | 'QR' | 'QL' | 'PL') {
  try {
    const memberRef = doc(db, 'projects', projectId, 'teams', teamId, 'members', userId);
    await updateDoc(memberRef, { role: newRole });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, 'members');
  }
}

export async function getProject(projectId: string) {
  try {
    const snap = await getDocs(query(collection(db, 'projects'), where('id', '==', projectId)));
    return null; // Implemented differently in components, we'll use doc()
  } catch (e) {}
}

export function subscribeToProjects(callback: (projects: Project[]) => void) {
  const q = query(collection(db, 'projects'), orderBy('updatedAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Project)));
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'projects');
  });
}

export async function createTask(data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) {
  const newRef = doc(collection(db, 'projects', data.projectId, 'tasks'));
  try {
    const task = {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    // remove undefined values
    Object.keys(task).forEach(key => task[key as keyof typeof task] === undefined && delete task[key as keyof typeof task]);

    await setDoc(newRef, task);
    return newRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'tasks');
  }
}

export function subscribeToTasks(projectId: string, callback: (tasks: Task[]) => void) {
  const q = query(collection(db, 'projects', projectId, 'tasks'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Task)));
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'tasks');
  });
}

export function subscribeToAssignedTasks(projectId: string, userId: string, callback: (tasks: Task[]) => void) {
  const q = query(
    collection(db, 'projects', projectId, 'tasks'), 
    where('assigneeId', '==', userId)
  );
  return onSnapshot(q, (snapshot) => {
    const tasks = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Task));
    tasks.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis());
    callback(tasks);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'tasks');
  });
}

export async function updateTask(projectId: string, taskId: string, data: Partial<Task>) {
  const taskRef = doc(db, 'projects', projectId, 'tasks', taskId);
  try {
    const updateData = {
      ...data,
      updatedAt: serverTimestamp()
    };
    Object.keys(updateData).forEach(key => updateData[key as keyof typeof updateData] === undefined && delete updateData[key as keyof typeof updateData]);
    await updateDoc(taskRef, updateData);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, 'tasks');
  }
}


// ... more methods to come ...
