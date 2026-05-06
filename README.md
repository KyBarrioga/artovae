# Picsal

A Next.js MVP for an art social app inspired by gallery-first and portfolio platforms.

## Setup

```bash
yarn install
yarn dev
```

Then open `http://localhost:3000`

Pages Directory
- /
- /login
- /user

Application Deployed @ `picsal.art`

Future implementation notes
5/6/2026 - Short break to implement other personal projects.
- ~~Delete Users~~
- ~~Make restrictions on user display name on setup to only use~~
    - ~~_ and - only 1 time and should not appear before actual text or characters~~
    - ~~should be lower case and upper case~~
- New round of frontend refactors and make portfolios selectable and toast message in progress
- Make edit profile endpoint
    - Put display picture as first option and set default preview
    - Required
        - display name
    - Not required
        - description
        - profile_picture
- Make tiles bigger in posts in a tighter maxed out layout with 5px padding (experiment with 6x6 or 8x8 layouts)
- Disable moving of tiles and make posts static
- make image posts viewable in a dialog with share options and display title and description
- Implement cropping for edit user profile image
- Implement cropping for posts for preview and thumbnails and actual image
- Other stuffs
