// O horario da linha de log e uma dependencia como outra qualquer: injetada,
// para que o teste possa fixar o instante sem congelar o processo.
export interface Clock {
  agora(): Date;
}
