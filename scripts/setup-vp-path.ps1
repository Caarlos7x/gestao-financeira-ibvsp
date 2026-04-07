$projectRoot = 'C:\Users\User\OneDrive\Documentos\projetos\sistema-financeiro'
$userPath = [Environment]::GetEnvironmentVariable('Path', 'User')
if ([string]::IsNullOrEmpty($userPath)) {
  $userPath = ''
}
if ($userPath -notmatch [regex]::Escape($projectRoot)) {
  $newPath = ($projectRoot + ';' + $userPath).TrimEnd(';')
  [Environment]::SetEnvironmentVariable('Path', $newPath, 'User')
  Write-Host 'User PATH updated: project folder prepended.'
} else {
  Write-Host 'User PATH already contains the project folder.'
}
