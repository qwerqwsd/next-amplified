import { generateServerClientUsingCookies } from '@aws-amplify/adapter-nextjs/api';
import { cookies } from 'next/headers';
// 1. Add the following two imports
import { revalidatePath } from 'next/cache';
import * as mutations from '@/graphql/mutations';
import * as queries from '@/graphql/queries';
import config from '@/amplifyconfiguration.json';

const cookiesClient = generateServerClientUsingCookies({
  config,
  cookies
});

// 2. Create a new Server Action
async function createTodo(formData: FormData) {
  'use server';
  const { data } = await cookiesClient.graphql({
    query: mutations.createTodo,
    variables: {
      input: {
        name: formData.get('name')?.toString() ?? ''
      }
    }
  });

  console.log('Created Todo: ', data?.createTodo);

  revalidatePath('/');
}

export default async function Home() {
  const {data,errors} = await cookiesClient.graphql({
    query: queries.listTodos
  })
  const todos = data.listTodos.items;
  return (
    <div
      style={{
        maxWidth: '500px',
        margin: '0 auto',
        textAlign: 'center',
        marginTop: '100px'
      }}
    >
      {/* 3. Update the form's action to use the
          new create Todo Server Action*/}
      <form action={createTodo}>
        <input name="name" placeholder="Add a todo" />
        <button type="submit">Add</button>
      </form>
      {(!todos || todos.length === 0 || errors)&&(
        <div>
          <p>No todoes, please add one.</p>
          </div>
      )}
      <ul>
        {todos.map((todo)=>{
          return <li style={{listStyle: 'none'}}>{todo.name}</li>;
        })}
      </ul>
    </div>
  );
}