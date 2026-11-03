<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Filesystem\Filesystem;
use Illuminate\Support\Str;
use ParseError;

#[Signature('make:module {name : Module name, for example ChatWithDocument}')]
#[Description('Create a module with its directories, controller, and service')]
class MakeModule extends Command
{
    /**
     * Execute the console command.
     */
    public function handle(Filesystem $files): int
    {
        $name = $this->argument('name');

        if (! preg_match('/^[A-Za-z][A-Za-z0-9_-]*$/D', $name)) {
            $this->error('Use a module name starting with a letter and containing only letters, numbers, hyphens, or underscores.');

            return self::FAILURE;
        }

        $name = Str::studly($name);
        $path = app_path("Modules/{$name}");

        if ($files->exists($path)) {
            $this->error("Module [{$name}] already exists. No files were changed.");

            return self::FAILURE;
        }

        $controller = str_replace('{{ module }}', $name, <<<'PHP'
<?php

namespace App\Modules\{{ module }}\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\{{ module }}\Services\{{ module }}Service;

class {{ module }}Controller extends Controller
{
    public function __construct(private {{ module }}Service $service) {}
}

PHP);

        $service = str_replace('{{ module }}', $name, <<<'PHP'
<?php

namespace App\Modules\{{ module }}\Services;

class {{ module }}Service
{
}

PHP);

        try {
            token_get_all($controller, TOKEN_PARSE);
            token_get_all($service, TOKEN_PARSE);
        } catch (ParseError) {
            $this->error('This module name is reserved or cannot be used in a PHP namespace.');

            return self::FAILURE;
        }

        foreach (['Controllers', 'Requests', 'Resources', 'Services', 'Models', 'Job', 'Events', 'Listeners', 'Enums'] as $directory) {
            $files->makeDirectory("{$path}/{$directory}", 0755, true);
        }

        $files->put("{$path}/Controllers/{$name}Controller.php", $controller);
        $files->put("{$path}/Services/{$name}Service.php", $service);
        $files->put("{$path}/routes.php", "<?php\n");

        $this->components->info("Module [{$name}] created in app/Modules/{$name}.");

        return self::SUCCESS;
    }
}
