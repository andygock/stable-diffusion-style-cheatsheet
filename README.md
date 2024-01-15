# Stable Diffusion Styling Cheat Sheet

A stand alone web site to guide user into different styling prompts for Stable Diffusion relating to fashion styling, hair and make up.

Images are generated using Stable Diffusion XL with [RealVisXL V3.0 + Turbo](https://civitai.com/models/139562/realvisxl-v30-turbo) checkpoint.

For development, I used [live-server](https://github.com/tapio/live-server). Favicon is by [ionicons](https://github.com/ionic-team/ionicons). Site inspired by [SupaGruen's cheatsheet](https://supagruen.github.io/StableDiffusion-CheatSheet/)

`images.original/` is my working dir for testing and resizing images. Due to the count and size of the images, they are not included in the repositary.

## Custom categories

Custom image categories can be added to the cheat sheet by creating a `/custom.json` to the project e.g

```json
{
  "useCustom": true,
  "items": ["intimate"]
}
```

Then adding `data/custom-intimate.json` and images to `images/custom-intimate/`. Use 4 images per prompt in the format `<prompt>.[1-4].webp`.
