<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class StorageService
{
    public function __construct(
        private string $disk = 'public',
        public string $basePath = 'uploads'
    ) {}

    public function setDisk(string $disk): self
    {
        $this->disk = $disk;

        return $this;

    }

    public function setBasePath(string $basePath): self
    {
        $this->basePath = $basePath;

        return $this;
    }

    public function upload(UploadedFile $file): array
    {
        $storagePath = $file->store($this->basePath, $this->disk);

        return [
            'original_name' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType(),
            'storage_path' => $storagePath,
            'extension' => $file->extension(),
            'size' => Storage::disk($this->disk)->size($storagePath),
        ];
    }

    public function delete(string $path): bool
    {
        return Storage::delete($path);
    }

    public function exists(string $path): bool
    {
        return Storage::disk($this->disk)->exists($path);
    }

    public function url(string $path): string
    {
        return Storage::disk($this->disk)->url($path);
    }

    public function download(string $path, ?string $name = null): StreamedResponse
    {
        return Storage::disk($this->disk)->download($path, $name);
    }
}
