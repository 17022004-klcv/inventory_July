<?php

namespace App\Services;

class PasswordRiskAnalyzer
{
    
    private array $commonPasswords =  [
        '123456', 'password', '123456789', '12345678', '12345',
        '1234567', 'qwerty', 'abc123', '111111', 'password1',
        'iloveyou', 'admin', 'letmein', 'welcome', 'monkey',
        '1234567890', 'dragon', 'master', 'sunshine', 'princess',
    ];

    private array $commonPatterns = [
        '/^(.)\1+$/',           // Caracteres repetidos: aaaaaaa
        '/^(012|123|234|345|456|567|678|789|890)+/', // Secuencias numéricas
        '/^(abc|bcd|cde|def|efg|fgh|ghi|hij)+/i',   // Secuencias alfabéticas
        '/^(qwerty|asdf|zxcv)+/i',                   // Patrones de teclado
    ];

    public function analyze(string $password, ?string $username = null): array 
    {
        $issues = [];
        $riskScore = 0;

        //longitud minima
        if(strlen($password) < 8){
            $issues[] = 'La contraseña es demasiado corta. Se recomienda al menos 8 caracteres.';
            $riskScore += 2;
        }

        //sin letras mayusculas
        if (!preg_match('/[A-Z]/', $password)) {
            $issues[] = 'No contiene letras mayúsculas.';
            $riskScore += 1;
        }

        //sin letras minusculas
        if (!preg_match('/[a-z]/', $password)) {
            $issues[] = 'No contiene letras minúsculas.';
            $riskScore += 1;
        }

        //sin numeros
        if (!preg_match('/[0-9]/', $password)) {
            $issues[] = 'No contiene números.';
            $riskScore += 1;
        }

        //sin caracteres especiales
        if (!preg_match('/[\W_]/', $password)) {
            $issues[] = 'No contiene caracteres especiales (@, #, !, etc.).';
            $riskScore += 2;
        }

         //contrasena comun
        if (in_array(strtolower($password), $this->commonPasswords)) {
            $issues[] = 'La contraseña es demasiado común y está en listas de brechas de seguridad.';
            $riskScore += 4;
        }

        //patrones obvios
        foreach ($this->commonPatterns as $pattern) {
            if (preg_match($pattern, $password)) {
                $issues[] = 'La contraseña sigue un patrón predecible (secuencia o repetición).';
                $riskScore += 3;
                break;
            }
        }

        //contiene el nombre de usuario
        if ($username && stripos($password, $username) !== false) {
            $issues[] = 'La contraseña contiene el nombre de usuario.';
            $riskScore += 3;
        }

        return [
            'risk_level'     => $this->classifyRisk($riskScore),
            'risk_score'     => $riskScore,
            'issues'         => $issues,
            'issues_count'   => count($issues),
            'recommendation' => $this->getRecommendation($riskScore),
            'iso_compliant'  => $riskScore === 0,
        ];
    }

    private function classifyRisk(int $score): string{
        if($score === 0) return 'ninguno';
        if($score <=2) return 'bajo';
        if($score <=5) return 'medio';
        return 'alto';
    }

    private function getRecommendation(int $score) : string{
        if($score === 0) return 'La contraseña cumple con los controles de seguridad.';
        if($score <=2) return 'Considere agregar más caracteres, mayúsculas, números o símbolos para mejorar la seguridad.';
        if($score <=5) return 'La contraseña presenta riesgos moderados. Se debe cambiar antes del próximo acceso.';
        return 'ALERTA: La contraseña es muy débil. Cambie la contraseña inmediatamente por una que sea única, larga y compleja.';
    }
    
}
