<?php

declare(strict_types=1);

namespace Drupal\Tests\civicactions_greenhouse\Unit;

use Drupal\civicactions_greenhouse\Client\GreenhouseClientInterface;
use Drupal\civicactions_greenhouse\Commands\GreenhouseCommands;
use Drupal\Core\Cache\CacheTagsInvalidatorInterface;
use Drush\Commands\DrushCommands;
use Drush\Style\DrushStyle;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\Group;
use PHPUnit\Framework\TestCase;

/**
 * Tests GreenhouseCommands Drush commands.
 */
#[CoversClass(GreenhouseCommands::class)]
#[Group('civicactions_greenhouse')]
class GreenhouseCommandsTest extends TestCase {

  /**
   * Tests successful refresh command execution.
   */
  public function testRefreshSuccess(): void {
    $client = $this->createMock(GreenhouseClientInterface::class);
    $client->expects($this->once())
      ->method('warmCache')
      ->willReturn([
        'jobs' => [
          [
            'id' => 101,
            'title' => 'Software Engineer',
            'location' => 'Remote',
          ],
        ],
        'from_cache' => FALSE,
        'error' => NULL,
      ]);

    $invalidator = $this->createMock(CacheTagsInvalidatorInterface::class);
    $invalidator->expects($this->once())
      ->method('invalidateTags')
      ->with(['civicactions_greenhouse:jobs']);

    $io = $this->createMock(DrushStyle::class);
    $io->expects($this->exactly(2))->method('comment');
    $io->expects($this->once())->method('success');
    $io->expects($this->once())->method('table');

    $commands = new GreenhouseCommands($client, $invalidator);
    // Inject mock IO.
    $reflection = new \ReflectionClass(DrushCommands::class);
    $property = $reflection->getProperty('io');
    $property->setValue($commands, $io);

    $exit_code = $commands->refresh();
    $this->assertEquals(DrushCommands::EXIT_SUCCESS, $exit_code);
  }

  /**
   * Tests refresh command when client returns an error.
   */
  public function testRefreshFailure(): void {
    $client = $this->createMock(GreenhouseClientInterface::class);
    $client->expects($this->once())
      ->method('warmCache')
      ->willReturn([
        'jobs' => [],
        'from_cache' => FALSE,
        'error' => 'API Timeout',
      ]);

    $invalidator = $this->createMock(CacheTagsInvalidatorInterface::class);
    $invalidator->expects($this->once())
      ->method('invalidateTags')
      ->with(['civicactions_greenhouse:jobs']);

    $io = $this->createMock(DrushStyle::class);
    $io->expects($this->once())->method('error')->with('API Timeout');

    $commands = new GreenhouseCommands($client, $invalidator);
    $reflection = new \ReflectionClass(DrushCommands::class);
    $property = $reflection->getProperty('io');
    $property->setValue($commands, $io);

    $exit_code = $commands->refresh();
    $this->assertEquals(DrushCommands::EXIT_FAILURE, $exit_code);
  }

}
