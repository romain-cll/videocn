# videoCn

A full-featured video player, built on the native `<video>` element and shadcn/ui components,
distributed as a shadcn registry. It inherits the theme of the project that installs it.

This repository contains **the player and its site**. The video hosting SaaS (transcoding,
thumbnail sprites, AI subtitles) lives in a separate, private repository: the player does not know
about it and must never know about it. It consumes standard web formats — WebVTT, `<track>`, HLS —
that the user produces themselves or outsources.

## Structure

```
registry.json          the manifest: the `player` item and the list of its files
registry/videocn/      the distributed sources, flat: a mirror of what the user receives
                       in <ui>/video-player/ → read registry/README.md before touching it
src/                   the site (Next.js): landing, docs, demos — never distributed
public/r/              output of `shadcn build`, regenerated, git-ignored
```

## Commands

```bash
pnpm dev               # the site, locally
pnpm registry:build    # registry.json → public/r/*.json
pnpm registry:serve    # build + serves public/ on :4000, to test an install
pnpm build             # registry:build then next build
pnpm typecheck         # requires a prior `next build` (generated types)
```

## Caveat

The registry URL is a public contract. Once it appears in someone's `components.json`, it can no
longer change without breaking their project. It is defined in a single place,
`src/lib/site-config.ts`, and is `https://videocn.dev/r/{name}.json`.

## Consuming the registry

```json
{
  "registries": {
    "@videocn": "https://videocn.dev/r/{name}.json"
  }
}
```

```bash
pnpm dlx shadcn@latest add @videocn/player
```

Only one item is published. This command installs the entire player — all the necessary files,
grouped in `<ui>/video-player/` — and the shadcn primitives missing from the host project. No
player control is distributed separately.

## License

This project is licensed under the MIT License — see the [LICENSE](./LICENSE) file.
