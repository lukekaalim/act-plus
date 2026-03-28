import { Component, h } from "@lukekaalim/act";
import { Markdown, parser } from "@lukekaalim/act-markdown";
import { renderMarkdown } from "@lukekaalim/grimoire";
import { Root } from 'mdast';
import * as YAML from 'yaml'

const taskFiles = import.meta.glob('./tasks/**/*.md', { query: 'raw', eager: true, import: 'default' }) as Record<string, string>;

type Task = {
  id: string,
  status: 'backlog' | 'complete' | 'in-progress',
  filename: string,
  root: Root,
  md: string,
}

const tasks: Task[] = []

for (const [filename, module] of Object.entries(taskFiles)) {
  const niceName = filename.slice('./tasks/'.length);
  if (niceName === '[template].md')
    continue;

  const root = parser.parse(module);

  const frontmatter = root.children[0];
  if (frontmatter.type !== 'yaml')
    throw new Error(`Task markdown missing frontmatter`);

  const frontmatterData = YAML.parse(frontmatter.value)

  tasks.push({
    md: module,
    filename: niceName,
    status: frontmatterData.status as Task['status'],
    id: frontmatterData.id as string,
    root,
  })
}

const styles = {
  page: {
    display: 'flex',
    'flex-direction': 'row',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  column: {
    display: 'flex',
    'flex-direction': 'column',
    flex: 1,
    margin: '16px',
  },
  columnTitle: {
    'text-align': 'center'
  },
  columnList: {
    'list-style': 'none',
    display: 'flex',
    'flex-direction': 'column',
    'overflow-y': 'auto',
    margin: '0',
    padding: '16px',
    gap: '16px',
    'background': '#f2f2f2',
    flex: 1,
    'border-radius': '32px',
  },
  task: {
    padding: '16px',
    //border: '1px solid #0000008c',
    'border-radius': '8px',
    'box-shadow': '#0000007e 0px 2px 8px 0px',
    background: 'white'
  },
  taskFilename: {
    'text-decoration': 'underline',
    'font-size': '0.8em',
  },
  taskId: {
    padding: '4px 8px',
    background: '#006050',
    color: 'white',
    'border-radius': '16px',
    'font-size': '0.8em',
  }
}

const TaskColumn: Component<{ status: string, tasks: Task[] }> = ({ status, tasks }) => {
  return h('div', { style: styles.column }, [
    h('h2', { style: styles.columnTitle }, status),
    h('ul', { style: styles.columnList }, tasks.map(task => {
      return h('li', { style: styles.task }, [
        h('div', {}, [
          h('span', { style: styles.taskId }, task.id),
          ' ',
          h('span', { style: styles.taskFilename }, task.filename),
        ]),
        renderMarkdown(task.root)
      ])
    }))
  ])
}

export const TaskPage: Component = () => {

  const backlog = tasks.filter(t => t.status === 'backlog');
  const inProgress = tasks.filter(t => t.status === 'in-progress');
  const complete = tasks.filter(t => t.status === 'complete');

  return [
    h('div', { style: styles.page }, [
      h(TaskColumn, { status: 'Backlog', tasks: backlog }),
      h(TaskColumn, { status: 'In Progress', tasks: inProgress }),
      h(TaskColumn, { status: 'Complete', tasks: complete }),
    ])
  ]
};
