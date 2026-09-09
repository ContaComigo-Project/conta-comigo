// O instante e injetado: o teste da virada do dia nao pode depender do relogio
// da maquina.
export interface Clock {
  agora(): Date;
}
