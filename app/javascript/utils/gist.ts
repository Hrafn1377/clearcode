export interface GistFile {
  name: string;
  content: string;
}

export interface GistResult {
  id: string;
  url: string;
  html_url: string;
}

export async function backupToGist(
  token: string,
  description: string,
  files: GistFile[],
  isPublic: boolean = false
): Promise<GistResult> {
  const filesObj: Record<string, { content: string }> = {};
  files.forEach(f => {
    filesObj[f.name] = { content: f.content || ' ' }; // Gist requires non-empty content
  });

  const res = await fetch('https://api.github.com/gists', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    body: JSON.stringify({
      description,
      public: isPublic,
      files: filesObj,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message ?? 'Failed to create Gist');
  }

  const data = await res.json();
  return {
    id: data.id,
    url: data.url,
    html_url: data.html_url,
  };
}

export async function restoreFromGist(token: string, gistId: string): Promise<GistFile[]> {
  const res = await fetch(`https://api.github.com/gists/${gistId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message ?? 'Failed to fetch Gist');
  }

  const data = await res.json();
  return Object.entries(data.files).map(([name, file]: [string, any]) => ({
    name,
    content: file.content ?? '',
  }));
}
